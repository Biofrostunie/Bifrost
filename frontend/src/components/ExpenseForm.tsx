
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/formatters";
import type { Expense, PaymentMethod } from "@/pages/ExpenseCalculator";
import { apiFetch } from "@/lib/api";

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  categories?: Array<{ value: string; label: string }>;
}

const ExpenseForm = ({ onAddExpense, categories: customCategories }: ExpenseFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("outros");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  const [essential, setEssential] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [bankAccountId, setBankAccountId] = useState<string | undefined>(undefined);
  const [creditCardId, setCreditCardId] = useState<string | undefined>(undefined);
  const [bankAccounts, setBankAccounts] = useState<Array<{ id: string; bankName: string; alias?: string }>>([]);
  const [creditCards, setCreditCards] = useState<Array<{ id: string; issuer: string; alias?: string; last4?: string; limit?: number }>>([]);

  const defaultCategories = [
    { value: "alimentacao", label: "Alimentação" },
    { value: "transporte", label: "Transporte" },
    { value: "moradia", label: "Moradia" },
    { value: "saude", label: "Saúde" },
    { value: "lazer", label: "Lazer" },
    { value: "educacao", label: "Educação" },
    { value: "outros", label: "Outros" },
  ];
  
  const categories = customCategories || defaultCategories;

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch('/bank-accounts', { token })
      .then((res) => setBankAccounts((res?.data ?? []) as any[]))
      .catch(() => {});
    apiFetch('/credit-cards', { token })
      .then((res) => setCreditCards((res?.data ?? []) as any[]))
      .catch(() => {});
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || isNaN(Number(amount))) return;

    const payload: Omit<Expense, 'id'> = {
      description,
      amount: Number(amount),
      category,
      date,
      essential,
      notes: notes || undefined,
      paymentMethod,
      bankAccountId: paymentMethod === 'BANK_ACCOUNT' ? bankAccountId : undefined,
      creditCardId: paymentMethod === 'CREDIT_CARD' ? creditCardId : undefined,
    };

    onAddExpense(payload);

    // reset
    setDescription("");
    setAmount("");
    setNotes("");
    setEssential(false);
    setPaymentMethod('CASH');
    setBankAccountId(undefined);
    setCreditCardId(undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Descrição</Label>
          <Input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex.: Mercado, combustível..."
          />
        </div>
        <div>
          <Label>Valor</Label>
          <Input
            type="number"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Categoria</Label>
          <Select onValueChange={(v) => setCategory(v)} defaultValue={category}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Data</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <div>
          <Label>Essencial?</Label>
          <Select onValueChange={(v) => setEssential(v === 'true')} defaultValue={String(essential)}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="false">Não</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Origem do gasto: cartão (crédito) ou conta (débito) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label>Origem do Pagamento</Label>
          <Select onValueChange={(v) => setPaymentMethod(v as PaymentMethod)} defaultValue={paymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Dinheiro</SelectItem>
              <SelectItem value="BANK_ACCOUNT">Conta (Débito)</SelectItem>
              <SelectItem value="CREDIT_CARD">Cartão (Crédito)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {paymentMethod === 'BANK_ACCOUNT' && (
          <div>
            <Label>Conta Bancária</Label>
            <Select onValueChange={(v) => setBankAccountId(v)} defaultValue={bankAccountId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent>
                {bankAccounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.alias ? `${acc.alias} (${acc.bankName})` : acc.bankName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {paymentMethod === 'CREDIT_CARD' && (
          <div>
            <Label>Cartão de Crédito</Label>
            <Select onValueChange={(v) => setCreditCardId(v)} defaultValue={creditCardId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o cartão" />
              </SelectTrigger>
              <SelectContent>
                {creditCards.map((cc) => (
                  <SelectItem key={cc.id} value={cc.id}>
                    {(cc.alias || cc.issuer) + (cc.last4 ? ` •••• ${cc.last4}` : '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label>Observações</Label>
        <Input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Opcional" />
      </div>

      <div className="flex justify-end">
        <Button type="submit">Adicionar</Button>
      </div>
    </form>
  );
};

export default ExpenseForm;
