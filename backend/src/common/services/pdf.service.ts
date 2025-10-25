import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import { PrismaService } from '../../prisma/prisma.service';
import { CacheService } from '../../redis/cache.service';

export interface ExpenseReportData {
  expenses: {
    id: string;
    userId: string;
    description: string;
    amount: number;
    category: string;
    date: Date;
    essential: boolean;
    notes?: string;
    createdAt: Date;
    user?: {
      id: string;
      email: string;
      fullName: string;
    };
  }[];
  totalAmount: number;
  period: {
    startDate: string;
    endDate: string;
  };
  user: {
    fullName: string;
    email: string;
  };
  categories: {
    name: string;
    total: number;
    percentage: number;
    color: string;
  }[];
}

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browserInstance: puppeteer.Browser | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<puppeteer.Browser> | null = null;

  // Cores predefinidas para categorias
  private readonly categoryColors = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
    '#FF9F40', '#E7E9ED', '#71B37C', '#FFA726', '#AB47BC',
    '#26C6DA', '#66BB6A', '#FFCA28', '#8D6E63', '#78909C'
  ];

  constructor(private readonly cacheService: CacheService) {}

  async generateExpenseReport(data: ExpenseReportData): Promise<Buffer> {
    const requestId = Math.random().toString(36).substring(7);
    this.logger.log(`[${requestId}] Starting PDF generation for expense report`);
    
    let page: puppeteer.Page | null = null;
    
    try {
      // Verificar cache primeiro
      const cacheKey = `pdf_report:${JSON.stringify(data)}`;
      const cachedPdf = await this.cacheService.get<string>(cacheKey);
      
      if (cachedPdf) {
        this.logger.log(`[${requestId}] PDF found in cache`);
        return Buffer.from(cachedPdf, 'base64');
      }

      // Validar dados de entrada
      this.validateReportData(data, requestId);

      // Adicionar cores às categorias se não existirem
      const enhancedData = this.enhanceDataWithColors(data);

      // Obter ou criar instância do browser
      const browser = await this.getBrowserInstanceWithRetry(requestId);
      
      // Criar nova página
      page = await this.createPage(browser, requestId);
      
      // Gerar e definir conteúdo HTML com gráficos
      const htmlContent = this.generateReportHTML(enhancedData, requestId);
      await this.setPageContent(page, htmlContent, requestId);
      
      // Aguardar renderização dos gráficos
      await this.waitForChartsToRender(page, requestId);
      
      // Gerar PDF
      const pdfBuffer = await this.generatePDF(page, requestId);
      
      // Fechar página (mas manter browser para reutilização)
      await this.safeClosePage(page, requestId);
      
      // Cache do PDF por 30 minutos
      await this.cacheService.set(cacheKey, pdfBuffer.toString('base64'), { ttl: 1800 });
      
      this.logger.log(`[${requestId}] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;

    } catch (error) {
      this.logger.error(`[${requestId}] Error generating PDF:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        dataSize: data?.expenses?.length || 0,
        userEmail: data?.user?.email || 'unknown',
      });
      
      // Garantir que a página seja fechada em caso de erro
      if (page) {
        await this.safeClosePage(page, requestId);
      }
      
      // Fechar browser em erros críticos
      if (this.isCriticalError(error)) {
        await this.closeBrowser(requestId);
      }
      
      throw this.createUserFriendlyError(error);
    }
  }

  private enhanceDataWithColors(data: ExpenseReportData): ExpenseReportData {
    const enhancedCategories = data.categories.map((category, index) => ({
      ...category,
      color: category.color || this.categoryColors[index % this.categoryColors.length],
    }));

    return {
      ...data,
      categories: enhancedCategories,
    };
  }

  private validateReportData(data: ExpenseReportData, requestId: string): void {
    this.logger.log(`[${requestId}] Validating report data`);
    
    if (!data) {
      throw new Error('No report data provided');
    }
    
    if (!data.expenses || !Array.isArray(data.expenses)) {
      throw new Error('Invalid expense data provided');
    }
    
    if (!data.user || !data.user.email) {
      throw new Error('Invalid user data provided');
    }

    this.logger.log(`[${requestId}] Report data validation passed - ${data.expenses.length} expenses`);
  }

  private async getBrowserInstanceWithRetry(requestId: string, maxRetries = 3): Promise<puppeteer.Browser> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        this.logger.log(`[${requestId}] Browser instance attempt ${attempt}/${maxRetries}`);
        return await this.getBrowserInstance(requestId);
      } catch (error) {
        this.logger.warn(`[${requestId}] Browser instance attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          throw error;
        }
        
        // Fechar qualquer browser existente antes de tentar novamente
        await this.closeBrowser(requestId);
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error('Failed to create browser instance after all retries');
  }

  private async getBrowserInstance(requestId: string): Promise<puppeteer.Browser> {
    // Se já estamos inicializando, aguardar a conclusão
    if (this.isInitializing && this.initializationPromise) {
      this.logger.log(`[${requestId}] Waiting for existing browser initialization`);
      return await this.initializationPromise;
    }

    // Verificar se o browser existente ainda está conectado
    if (this.browserInstance && this.browserInstance.isConnected()) {
      try {
        // Testar o browser criando uma página de teste
        const testPage = await this.browserInstance.newPage();
        await testPage.close();
        this.logger.log(`[${requestId}] Reusing existing browser instance`);
        return this.browserInstance;
      } catch (error) {
        this.logger.warn(`[${requestId}] Existing browser instance is not working:`, error);
        this.browserInstance = null;
      }
    }

    // Criar nova instância do browser
    this.isInitializing = true;
    this.initializationPromise = this.createNewBrowser(requestId);
    
    try {
      this.browserInstance = await this.initializationPromise;
      return this.browserInstance;
    } finally {
      this.isInitializing = false;
      this.initializationPromise = null;
    }
  }

  private async createNewBrowser(requestId: string): Promise<puppeteer.Browser> {
    this.logger.log(`[${requestId}] Creating new browser instance`);
    
    // Configuração aprimorada do browser para máxima compatibilidade
    const browserOptions: puppeteer.LaunchOptions = {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-ipc-flooding-protection',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-sync',
        '--disable-translate',
        '--hide-scrollbars',
        '--mute-audio',
        '--disable-background-networking',
        '--disable-client-side-phishing-detection',
        '--disable-hang-monitor',
        '--disable-popup-blocking',
        '--disable-prompt-on-repost',
        '--disable-web-resources',
        '--metrics-recording-only',
        '--no-default-browser-check',
        '--safebrowsing-disable-auto-update',
        '--disable-software-rasterizer',
        '--memory-pressure-off',
        '--max_old_space_size=4096',
        '--single-process',
      ],
      timeout: 60000,
      protocolTimeout: 60000,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      ignoreDefaultArgs: ['--disable-extensions'],
    };

    // Usar Chromium do sistema se disponível (para Docker)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      this.logger.log(`[${requestId}] Using system Chromium: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }

    try {
      const browser = await puppeteer.launch(browserOptions);
      this.logger.log(`[${requestId}] Browser launched successfully`);
      
      // Configurar handlers de erro
      browser.on('disconnected', () => {
        this.logger.warn(`[${requestId}] Browser disconnected`);
        this.browserInstance = null;
      });

      // Testar funcionalidade do browser
      const testPage = await browser.newPage();
      await testPage.goto('data:text/html,<h1>Test</h1>', { waitUntil: 'domcontentloaded' });
      await testPage.close();
      
      this.logger.log(`[${requestId}] Browser functionality test passed`);
      return browser;
      
    } catch (error) {
      this.logger.error(`[${requestId}] Failed to launch browser:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        executablePath: browserOptions.executablePath,
      });
      throw new Error(`Failed to initialize PDF generator: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createPage(browser: puppeteer.Browser, requestId: string): Promise<puppeteer.Page> {
    this.logger.log(`[${requestId}] Creating new page`);
    
    try {
      const page = await browser.newPage();
      
      // Configuração aprimorada da página
      await page.setViewport({ 
        width: 1200, 
        height: 800,
        deviceScaleFactor: 1,
      });

      // Definir user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Permitir recursos necessários para Chart.js
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        const url = req.url();
        
        // Permitir Chart.js e recursos essenciais
        if (url.includes('chart.js') || url.includes('cdn.jsdelivr.net') || 
            resourceType === 'document' || resourceType === 'script') {
          req.continue();
        } else if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Definir timeouts
      page.setDefaultTimeout(45000);
      page.setDefaultNavigationTimeout(45000);

      // Tratar erros da página
      page.on('error', (error) => {
        this.logger.error(`[${requestId}] Page error:`, error);
      });

      page.on('pageerror', (error) => {
        this.logger.error(`[${requestId}] Page script error:`, error);
      });

      this.logger.log(`[${requestId}] Page created successfully`);
      return page;
      
    } catch (error) {
      this.logger.error(`[${requestId}] Failed to create page:`, error);
      throw new Error('Failed to create PDF page');
    }
  }

  private async setPageContent(page: puppeteer.Page, htmlContent: string, requestId: string): Promise<void> {
    this.logger.log(`[${requestId}] Setting page content (${htmlContent.length} characters)`);
    
    try {
      await page.setContent(htmlContent, { 
        waitUntil: ['domcontentloaded', 'networkidle0'],
        timeout: 30000,
      });

      this.logger.log(`[${requestId}] Page content set successfully`);
    } catch (error) {
      this.logger.error(`[${requestId}] Error setting page content:`, error);
      throw new Error('Failed to load report content');
    }
  }

  private async waitForChartsToRender(page: puppeteer.Page, requestId: string): Promise<void> {
    this.logger.log(`[${requestId}] Waiting for charts to render`);
    
    try {
      // Aguardar Chart.js carregar e os gráficos serem renderizados
      await page.waitForFunction(
        () => {
          // Verificar se Chart.js está disponível no contexto global
          return (window as any).Chart && 
                 document.querySelector('#categoryPieChart') && 
                 document.querySelector('#essentialPieChart');
        },
        { timeout: 10000 }
      );

      // Aguardar um pouco mais para garantir que os gráficos estejam completamente renderizados
      // Usar setTimeout em vez de waitForTimeout que não existe
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.logger.log(`[${requestId}] Charts rendered successfully`);
    } catch (error) {
      this.logger.warn(`[${requestId}] Charts may not have rendered properly:`, error);
      // Não falhar se os gráficos não renderizarem - o PDF ainda pode ser gerado
    }
  }

  private async generatePDF(page: puppeteer.Page, requestId: string): Promise<Buffer> {
    this.logger.log(`[${requestId}] Generating PDF`);
    
    try {
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        margin: {
          top: '20mm',
          right: '20mm',
          bottom: '20mm',
          left: '20mm',
        },
        displayHeaderFooter: false,
        timeout: 30000,
        omitBackground: false,
        tagged: false,
      });

      if (!pdfBuffer || pdfBuffer.length === 0) {
        throw new Error('Generated PDF buffer is empty');
      }

      this.logger.log(`[${requestId}] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return Buffer.from(pdfBuffer);
      
    } catch (error) {
      this.logger.error(`[${requestId}] Error generating PDF:`, error);
      throw new Error('Failed to generate PDF document');
    }
  }

  private async safeClosePage(page: puppeteer.Page, requestId: string): Promise<void> {
    try {
      if (page && !page.isClosed()) {
        await page.close();
        this.logger.log(`[${requestId}] Page closed successfully`);
      }
    } catch (error) {
      this.logger.warn(`[${requestId}] Error closing page:`, error);
    }
  }

  private isCriticalError(error: unknown): boolean {
    if (error instanceof Error) {
      const criticalMessages = [
        'Protocol error',
        'Target closed',
        'Session closed',
        'Connection closed',
        'Browser has been closed',
        'Navigation failed',
        'net::ERR_',
      ];
      
      return criticalMessages.some(msg => error.message.includes(msg));
    }
    return false;
  }

  private createUserFriendlyError(error: unknown): Error {
    if (error instanceof Error) {
      if (error.message.includes('timeout') || error.message.includes('Navigation timeout')) {
        return new Error('PDF generation timed out. Please try again with fewer expenses or a smaller date range.');
      } else if (error.message.includes('Protocol error') || error.message.includes('Target closed')) {
        return new Error('Browser communication error. Please try again.');
      } else if (error.message.includes('Navigation') || error.message.includes('net::ERR_')) {
        return new Error('Failed to load report content. Please check your data and try again.');
      } else if (error.message.includes('Failed to launch') || error.message.includes('Failed to initialize')) {
        return new Error('PDF service is temporarily unavailable. Please try again later.');
      } else if (error.message.includes('No report data') || error.message.includes('Invalid')) {
        return new Error('Invalid data provided for report generation.');
      }
    }
    
    return new Error('Failed to generate PDF report. Please try again or contact support if the problem persists.');
  }

  private async closeBrowser(requestId?: string): Promise<void> {
    if (this.browserInstance) {
      try {
        await this.browserInstance.close();
        this.logger.log(`[${requestId || 'cleanup'}] Browser closed successfully`);
      } catch (error) {
        this.logger.warn(`[${requestId || 'cleanup'}] Error closing browser:`, error);
      } finally {
        this.browserInstance = null;
      }
    }
  }

  // Método de limpeza para desligamento gracioso
  async onModuleDestroy(): Promise<void> {
    this.logger.log('PdfService shutting down...');
    await this.closeBrowser('shutdown');
  }

  private generateReportHTML(data: ExpenseReportData, requestId: string): string {
    try {
      this.logger.log(`[${requestId}] Generating HTML template with charts`);

      const template = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Despesas - Bifröst</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.js"></script>
          <style>
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body {
                  font-family: 'Arial', sans-serif;
                  line-height: 1.6;
                  color: #333;
                  background: #fff;
                  font-size: 14px;
              }
              
              .header {
                  background: #667eea;
                  color: white;
                  padding: 30px;
                  text-align: center;
                  margin-bottom: 30px;
              }
              
              .header h1 {
                  font-size: 28px;
                  margin-bottom: 10px;
                  font-weight: 700;
              }
              
              .header p {
                  font-size: 16px;
                  opacity: 0.9;
              }
              
              .container {
                  max-width: 800px;
                  margin: 0 auto;
                  padding: 0 20px;
              }
              
              .info-section {
                  background: #f8f9fa;
                  padding: 20px;
                  border-radius: 8px;
                  margin-bottom: 30px;
                  border-left: 4px solid #667eea;
              }
              
              .info-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 20px;
              }
              
              .info-item {
                  display: flex;
                  flex-direction: column;
              }
              
              .info-label {
                  font-weight: 600;
                  color: #666;
                  font-size: 12px;
                  text-transform: uppercase;
                  margin-bottom: 5px;
              }
              
              .info-value {
                  font-size: 14px;
                  color: #333;
                  font-weight: 500;
              }
              
              .summary-cards {
                  display: grid;
                  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                  gap: 20px;
                  margin-bottom: 30px;
              }
              
              .summary-card {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  text-align: center;
                  border-top: 3px solid #667eea;
              }
              
              .summary-card h3 {
                  color: #666;
                  font-size: 12px;
                  margin-bottom: 10px;
                  text-transform: uppercase;
                  font-weight: 600;
              }
              
              .summary-card .value {
                  font-size: 24px;
                  font-weight: 700;
                  color: #667eea;
              }
              
              .section-title {
                  font-size: 20px;
                  color: #333;
                  margin-bottom: 20px;
                  padding-bottom: 10px;
                  border-bottom: 2px solid #667eea;
                  font-weight: 600;
              }
              
              .charts-section {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 30px;
                  margin-bottom: 30px;
              }
              
              .chart-container {
                  background: white;
                  padding: 20px;
                  border-radius: 8px;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                  text-align: center;
                  min-height: 400px;
              }
              
              .chart-title {
                  font-size: 16px;
                  font-weight: 600;
                  color: #333;
                  margin-bottom: 15px;
              }
              
              .chart-canvas {
                  width: 100% !important;
                  height: 300px !important;
                  max-width: 300px;
                  margin: 0 auto;
              }
              
              .category-item {
                  display: flex;
                  justify-content: space-between;
                  align-items: center;
                  padding: 15px;
                  background: #f8f9fa;
                  margin-bottom: 10px;
                  border-radius: 6px;
                  border-left: 4px solid #667eea;
              }
              
              .category-name {
                  font-weight: 600;
                  color: #333;
                  display: flex;
                  align-items: center;
              }
              
              .category-color {
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  margin-right: 10px;
                  display: inline-block;
              }
              
              .category-amount {
                  font-size: 16px;
                  color: #667eea;
                  font-weight: 700;
              }
              
              .category-percentage {
                  font-size: 12px;
                  color: #666;
                  margin-left: 10px;
              }
              
              .expenses-table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 20px;
                  background: white;
                  border-radius: 8px;
                  overflow: hidden;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
              }
              
              .expenses-table th {
                  background: #667eea;
                  color: white;
                  padding: 15px;
                  text-align: left;
                  font-weight: 600;
                  font-size: 12px;
                  text-transform: uppercase;
              }
              
              .expenses-table td {
                  padding: 12px 15px;
                  border-bottom: 1px solid #eee;
                  font-size: 13px;
              }
              
              .expenses-table tr:nth-child(even) {
                  background: #f8f9fa;
              }
              
              .amount {
                  font-weight: 700;
                  color: #d32f2f;
              }
              
              .essential {
                  background: #4caf50;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 600;
              }
              
              .non-essential {
                  background: #ff9800;
                  color: white;
                  padding: 4px 8px;
                  border-radius: 4px;
                  font-size: 11px;
                  font-weight: 600;
              }
              
              .footer {
                  margin-top: 40px;
                  padding: 20px;
                  text-align: center;
                  color: #666;
                  border-top: 1px solid #eee;
                  font-size: 12px;
              }
              
              .no-data {
                  text-align: center;
                  color: #666;
                  padding: 40px 20px;
                  background: #f8f9fa;
                  border-radius: 8px;
                  margin: 20px 0;
              }
              
              .no-data h3 {
                  margin-bottom: 10px;
                  color: #667eea;
              }

              @media print {
                  .charts-section {
                      page-break-inside: avoid;
                  }
                  
                  .chart-container {
                      break-inside: avoid;
                  }
              }
          </style>
      </head>
      <body>
          <div class="header">
              <h1>Relatório de Despesas</h1>
              <p>Bifröst Education Platform</p>
          </div>
          
          <div class="container">
              <div class="info-section">
                  <div class="info-grid">
                      <div class="info-item">
                          <span class="info-label">Usuário</span>
                          <span class="info-value">{{user.fullName}} ({{user.email}})</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Período</span>
                          <span class="info-value">{{period.startDate}} até {{period.endDate}}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Data de Geração</span>
                          <span class="info-value">{{currentDate}}</span>
                      </div>
                      <div class="info-item">
                          <span class="info-label">Total de Despesas</span>
                          <span class="info-value">{{expenses.length}} registros</span>
                      </div>
                  </div>
              </div>
              
              <div class="summary-cards">
                  <div class="summary-card">
                      <h3>Total Gasto</h3>
                      <div class="value">R$ {{formatCurrency totalAmount}}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Média por Despesa</h3>
                      <div class="value">R$ {{formatCurrency averageAmount}}</div>
                  </div>
                  <div class="summary-card">
                      <h3>Categorias</h3>
                      <div class="value">{{categories.length}}</div>
                  </div>
              </div>
              
              {{#if categories.length}}
              <div class="charts-section">
                  <div class="chart-container">
                      <div class="chart-title">Distribuição por Categoria</div>
                      <canvas id="categoryPieChart" class="chart-canvas"></canvas>
                  </div>
                  <div class="chart-container">
                      <div class="chart-title">Despesas Essenciais vs Não Essenciais</div>
                      <canvas id="essentialPieChart" class="chart-canvas"></canvas>
                  </div>
              </div>
              
              <div class="categories-section">
                  <h2 class="section-title">Despesas por Categoria</h2>
                  {{#each categories}}
                  <div class="category-item">
                      <span class="category-name">
                          <span class="category-color" style="background-color: {{this.color}};"></span>
                          {{this.name}}
                      </span>
                      <div>
                          <span class="category-amount">R$ {{formatCurrency this.total}}</span>
                          <span class="category-percentage">({{this.percentage}}%)</span>
                      </div>
                  </div>
                  {{/each}}
              </div>
              {{/if}}
              
              <div class="expenses-section">
                  <h2 class="section-title">Detalhamento das Despesas</h2>
                  {{#if expenses.length}}
                  <table class="expenses-table">
                      <thead>
                          <tr>
                              <th>Data</th>
                              <th>Descrição</th>
                              <th>Categoria</th>
                              <th>Valor</th>
                              <th>Essencial</th>
                          </tr>
                      </thead>
                      <tbody>
                          {{#each expenses}}
                          <tr>
                              <td>{{formatDate this.date}}</td>
                              <td>{{this.description}}</td>
                              <td>{{this.category}}</td>
                              <td class="amount">R$ {{formatCurrency this.amount}}</td>
                              <td>
                                  {{#if this.essential}}
                                  <span class="essential">Sim</span>
                                  {{else}}
                                  <span class="non-essential">Não</span>
                                  {{/if}}
                              </td>
                          </tr>
                          {{/each}}
                      </tbody>
                  </table>
                  {{else}}
                  <div class="no-data">
                      <h3>Nenhuma despesa encontrada</h3>
                      <p>Não foram encontradas despesas para o período e filtros selecionados.</p>
                      <p><strong>Período:</strong> {{period.startDate}} até {{period.endDate}}</p>
                  </div>
                  {{/if}}
              </div>
          </div>
          
          <div class="footer">
              <p><strong>Relatório gerado automaticamente pela Bifröst Education Platform</strong></p>
              <p>© 2024 - Todos os direitos reservados</p>
              <p>Gerado em: {{currentDate}}</p>
          </div>

          <script>
              // Aguardar o DOM e Chart.js estarem prontos
              function initializeCharts() {
                  // Verificar se Chart.js está disponível
                  if (typeof window.Chart === 'undefined') {
                      setTimeout(initializeCharts, 100);
                      return;
                  }

                  // Dados das categorias com valores absolutos
                  const categoryData = {{{categoryChartData}}};
                  const essentialData = {{{essentialChartData}}};

                  // Configuração comum para gráficos de pizza
                  const commonOptions = {
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                          legend: {
                              position: 'bottom',
                              labels: {
                                  padding: 15,
                                  usePointStyle: true,
                                  font: {
                                      size: 11
                                  },
                                  generateLabels: function(chart) {
                                      const data = chart.data;
                                      if (data.labels.length && data.datasets.length) {
                                          return data.labels.map((label, i) => {
                                              const dataset = data.datasets[0];
                                              const value = dataset.data[i];
                                              const total = dataset.data.reduce((a, b) => a + b, 0);
                                              const percentage = ((value / total) * 100).toFixed(1);
                                              return {
                                                  text: label + ' (' + percentage + '%)',
                                                  fillStyle: dataset.backgroundColor[i],
                                                  strokeStyle: dataset.borderColor[i],
                                                  lineWidth: dataset.borderWidth,
                                                  hidden: false,
                                                  index: i
                                              };
                                          });
                                      }
                                      return [];
                                  }
                              }
                          },
                          tooltip: {
                              callbacks: {
                                  label: function(context) {
                                      const label = context.label || '';
                                      const value = context.parsed;
                                      const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                      const percentage = ((value / total) * 100).toFixed(1);
                                      return label + ': R$ ' + value.toFixed(2) + ' (' + percentage + '%)';
                                  }
                              }
                          }
                      },
                      // Configuração específica para melhorar a visualização
                      elements: {
                          arc: {
                              borderWidth: 2
                          }
                      }
                  };

                  // Configuração do gráfico de categorias
                  if (categoryData.labels.length > 0 && categoryData.datasets[0].data.some(val => val > 0)) {
                      const categoryCtx = document.getElementById('categoryPieChart');
                      if (categoryCtx) {
                          new window.Chart(categoryCtx, {
                              type: 'pie',
                              data: categoryData,
                              options: {
                                  ...commonOptions,
                                  plugins: {
                                      ...commonOptions.plugins,
                                      title: {
                                          display: false
                                      }
                                  }
                              }
                          });
                      }
                  }

                  // Configuração do gráfico essencial vs não essencial
                  if (essentialData.labels.length > 0 && essentialData.datasets[0].data.some(val => val > 0)) {
                      const essentialCtx = document.getElementById('essentialPieChart');
                      if (essentialCtx) {
                          new window.Chart(essentialCtx, {
                              type: 'pie',
                              data: essentialData,
                              options: {
                                  ...commonOptions,
                                  plugins: {
                                      ...commonOptions.plugins,
                                      title: {
                                          display: false
                                      }
                                  }
                              }
                          });
                      }
                  }
              }

              // Inicializar quando o DOM estiver pronto
              if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initializeCharts);
              } else {
                  initializeCharts();
              }
          </script>
      </body>
      </html>
      `;

      // Registrar helpers do Handlebars com tratamento de erro
      handlebars.registerHelper('formatCurrency', (amount) => {
        try {
          const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
          return new Intl.NumberFormat('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(numAmount);
        } catch (error) {
          this.logger.warn(`[${requestId}] Error formatting currency:`, error);
          return '0,00';
        }
      });

      handlebars.registerHelper('formatDate', (date) => {
        try {
          return moment(date).format('DD/MM/YYYY');
        } catch (error) {
          this.logger.warn(`[${requestId}] Error formatting date:`, error);
          return 'Data inválida';
        }
      });

      // Calcular dados adicionais
      const averageAmount = data.expenses.length > 0 ? data.totalAmount / data.expenses.length : 0;
      const currentDate = moment().format('DD/MM/YYYY HH:mm:ss');

      // Preparar dados para gráficos com valores absolutos
      const categoryChartData = this.prepareCategoryChartData(data.categories);
      const essentialChartData = this.prepareEssentialChartData(data.expenses);

      const templateData = {
        ...data,
        averageAmount,
        currentDate,
        categoryChartData: JSON.stringify(categoryChartData),
        essentialChartData: JSON.stringify(essentialChartData),
        user: {
          fullName: data.user.fullName || 'Usuário',
          email: data.user.email || 'email@exemplo.com',
        },
        period: {
          startDate: data.period.startDate || 'Início',
          endDate: data.period.endDate || 'Fim',
        },
      };

      const compiledTemplate = handlebars.compile(template);
      const htmlContent = compiledTemplate(templateData);

      this.logger.log(`[${requestId}] HTML template with enhanced charts generated successfully (${htmlContent.length} characters)`);
      return htmlContent;

    } catch (error) {
      this.logger.error(`[${requestId}] Error generating HTML template:`, error);
      throw new Error('Failed to generate report template');
    }
  }

  private prepareCategoryChartData(categories: ExpenseReportData['categories']) {
    // Filtrar categorias com valores maiores que zero
    const validCategories = categories.filter(cat => cat.total > 0);
    
    return {
      labels: validCategories.map(cat => cat.name),
      datasets: [{
        data: validCategories.map(cat => cat.total), // Usar valores absolutos
        backgroundColor: validCategories.map(cat => cat.color),
        borderColor: validCategories.map(cat => cat.color),
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }

  private prepareEssentialChartData(expenses: ExpenseReportData['expenses']) {
    const essentialTotal = expenses
      .filter(exp => exp.essential)
      .reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount))), 0);
    
    const nonEssentialTotal = expenses
      .filter(exp => !exp.essential)
      .reduce((sum, exp) => sum + (typeof exp.amount === 'number' ? exp.amount : parseFloat(String(exp.amount))), 0);

    const data = [];
    const labels = [];
    const colors = [];

    // Apenas adicionar categorias com valores maiores que zero
    if (essentialTotal > 0) {
      data.push(essentialTotal);
      labels.push('Essenciais');
      colors.push('#4caf50');
    }

    if (nonEssentialTotal > 0) {
      data.push(nonEssentialTotal);
      labels.push('Não Essenciais');
      colors.push('#ff9800');
    }

    return {
      labels,
      datasets: [{
        data, // Usar valores absolutos
        backgroundColor: colors,
        borderColor: colors,
        borderWidth: 2,
        hoverOffset: 4
      }]
    };
  }
}