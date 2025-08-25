import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import * as puppeteer from 'puppeteer';
import * as handlebars from 'handlebars';
import * as moment from 'moment';
import { Expense } from '@prisma/client';

export interface ExpenseReportData {
  expenses: (Expense & {
    user?: {
      id: string;
      email: string;
      fullName: string;
    };
  })[];
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
  }[];
}

@Injectable()
export class PdfService implements OnModuleDestroy {
  private readonly logger = new Logger(PdfService.name);
  private browserInstance: puppeteer.Browser | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<puppeteer.Browser> | null = null;

  async generateExpenseReport(data: ExpenseReportData): Promise<Buffer> {
    const requestId = Math.random().toString(36).substring(7);
    this.logger.log(`[${requestId}] Starting PDF generation for expense report`);
    
    let page: puppeteer.Page | null = null;
    
    try {
      // Validate input data first
      this.validateReportData(data, requestId);

      // Get or create browser instance with retry logic
      const browser = await this.getBrowserInstanceWithRetry(requestId);
      
      // Create new page with enhanced configuration
      page = await this.createPage(browser, requestId);
      
      // Generate and set HTML content
      const htmlContent = this.generateReportHTML(data, requestId);
      await this.setPageContent(page, htmlContent, requestId);
      
      // Generate PDF with timeout
      const pdfBuffer = await this.generatePDF(page, requestId);
      
      // Close page (but keep browser for reuse)
      await this.safeClosePage(page, requestId);
      
      this.logger.log(`[${requestId}] PDF generated successfully, size: ${pdfBuffer.length} bytes`);
      return pdfBuffer;

    } catch (error) {
      this.logger.error(`[${requestId}] Error generating PDF:`, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        dataSize: data?.expenses?.length || 0,
        userEmail: data?.user?.email || 'unknown',
      });
      
      // Ensure page is closed on error
      if (page) {
        await this.safeClosePage(page, requestId);
      }
      
      // Close browser on critical errors
      if (this.isCriticalError(error)) {
        await this.closeBrowser(requestId);
      }
      
      throw this.createUserFriendlyError(error);
    }
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
        
        // Close any existing browser before retry
        await this.closeBrowser(requestId);
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error('Failed to create browser instance after all retries');
  }

  private async getBrowserInstance(requestId: string): Promise<puppeteer.Browser> {
    // If we're already initializing, wait for that to complete
    if (this.isInitializing && this.initializationPromise) {
      this.logger.log(`[${requestId}] Waiting for existing browser initialization`);
      return await this.initializationPromise;
    }

    // Check if existing browser is still connected
    if (this.browserInstance && this.browserInstance.isConnected()) {
      try {
        // Test the browser by creating a test page
        const testPage = await this.browserInstance.newPage();
        await testPage.close();
        this.logger.log(`[${requestId}] Reusing existing browser instance`);
        return this.browserInstance;
      } catch (error) {
        this.logger.warn(`[${requestId}] Existing browser instance is not working:`, error);
        this.browserInstance = null;
      }
    }

    // Create new browser instance
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
    
    // Enhanced browser configuration for maximum compatibility
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
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-component-extensions-with-background-pages',
        '--disable-default-apps',
        '--disable-extensions',
        '--disable-plugins',
        '--disable-preconnect',
        '--disable-print-preview',
        '--disable-sync',
        '--disable-web-security',
        '--no-default-browser-check',
        '--no-first-run',
        '--no-pings',
        '--no-service-autorun',
        '--password-store=basic',
        '--use-mock-keychain',
        '--single-process',
      ],
      timeout: 60000,
      protocolTimeout: 60000,
      handleSIGINT: false,
      handleSIGTERM: false,
      handleSIGHUP: false,
      ignoreDefaultArgs: ['--disable-extensions'],
    };

    // Use system Chromium if available (for Docker)
    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
      browserOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
      this.logger.log(`[${requestId}] Using system Chromium: ${process.env.PUPPETEER_EXECUTABLE_PATH}`);
    }

    try {
      const browser = await puppeteer.launch(browserOptions);
      this.logger.log(`[${requestId}] Browser launched successfully`);
      
      // Set up error handlers
      browser.on('disconnected', () => {
        this.logger.warn(`[${requestId}] Browser disconnected`);
        this.browserInstance = null;
      });

      browser.on('targetcreated', () => {
        this.logger.debug(`[${requestId}] Browser target created`);
      });

      browser.on('targetdestroyed', () => {
        this.logger.debug(`[${requestId}] Browser target destroyed`);
      });

      // Test browser functionality
      const testPage = await browser.newPage();
      await testPage.goto('data:text/html,<h1>Test</h1>', { waitUntil: 'domcontentloaded' });
      await testPage.close();
      
      this.logger.log(`[${requestId}] Browser functionality test passed`);
      return browser;
      
    } catch (error) {
      this.logger.error(`[${requestId}] Failed to launch browser:`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        executablePath: browserOptions.executablePath,
        args: browserOptions.args?.slice(0, 10),
      });
      throw new Error(`Failed to initialize PDF generator: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createPage(browser: puppeteer.Browser, requestId: string): Promise<puppeteer.Page> {
    this.logger.log(`[${requestId}] Creating new page`);
    
    try {
      const page = await browser.newPage();
      
      // Enhanced page configuration
      await page.setViewport({ 
        width: 1200, 
        height: 800,
        deviceScaleFactor: 1,
      });

      // Set user agent
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      // Disable images and other resources to speed up loading
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const resourceType = req.resourceType();
        if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
          req.abort();
        } else {
          req.continue();
        }
      });

      // Set timeouts
      page.setDefaultTimeout(45000);
      page.setDefaultNavigationTimeout(45000);

      // Handle page errors
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
        waitUntil: ['domcontentloaded'],
        timeout: 30000,
      });

      // Wait for page to be ready with additional checks
      await page.evaluate(() => {
        return new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Page ready timeout'));
          }, 10000);

          const checkReady = () => {
            if (document.readyState === 'complete') {
              clearTimeout(timeout);
              resolve();
            } else {
              setTimeout(checkReady, 100);
            }
          };

          checkReady();
        });
      });

      this.logger.log(`[${requestId}] Page content set successfully`);
    } catch (error) {
      this.logger.error(`[${requestId}] Error setting page content:`, error);
      throw new Error('Failed to load report content');
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
      // Mapear erros específicos para mensagens esperadas nos testes
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

  // Cleanup method for graceful shutdown
  async onModuleDestroy(): Promise<void> {
    this.logger.log('PdfService shutting down...');
    await this.closeBrowser('shutdown');
  }

  private generateReportHTML(data: ExpenseReportData, requestId: string): string {
    try {
      this.logger.log(`[${requestId}] Generating HTML template`);

      const template = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Relatório de Despesas - Bifröst</title>
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
              <div class="categories-section">
                  <h2 class="section-title">Despesas por Categoria</h2>
                  {{#each categories}}
                  <div class="category-item">
                      <span class="category-name">{{this.name}}</span>
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
                      {{#if hasFilters}}
                      <p><strong>Filtros aplicados:</strong> Categoria: {{filterCategory}}, Essencial: {{filterEssential}}</p>
                      {{/if}}
                  </div>
                  {{/if}}
              </div>
          </div>
          
          <div class="footer">
              <p><strong>Relatório gerado automaticamente pela Bifröst Education Platform</strong></p>
              <p>© 2024 - Todos os direitos reservados</p>
              <p>Gerado em: {{currentDate}}</p>
          </div>
      </body>
      </html>
      `;

      // Register Handlebars helpers with error handling
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

      // Calculate additional data with error handling
      const averageAmount = data.expenses.length > 0 ? data.totalAmount / data.expenses.length : 0;
      const currentDate = moment().format('DD/MM/YYYY HH:mm:ss');

      const templateData = {
        ...data,
        averageAmount,
        currentDate,
        user: {
          fullName: data.user.fullName || 'Usuário',
          email: data.user.email || 'email@exemplo.com',
        },
        period: {
          startDate: data.period.startDate || 'Início',
          endDate: data.period.endDate || 'Fim',
        },
        hasFilters: !!(data.period.startDate !== 'Início' || data.period.endDate !== 'Fim'),
        filterCategory: data.period.startDate !== 'Início' ? 'Sim' : 'Não',
        filterEssential: data.period.endDate !== 'Fim' ? 'Sim' : 'Não',
      };

      const compiledTemplate = handlebars.compile(template);
      const htmlContent = compiledTemplate(templateData);

      this.logger.log(`[${requestId}] HTML template generated successfully (${htmlContent.length} characters)`);
      return htmlContent;

    } catch (error) {
      this.logger.error(`[${requestId}] Error generating HTML template:`, error);
      throw new Error('Failed to generate report template');
    }
  }
}