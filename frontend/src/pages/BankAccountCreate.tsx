import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiFetch } from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/formatters";

const schema = z.object({
  bankName: z.string().min(1, "Banco é obrigatório"),
  alias: z.string().optional(),
  accountType: z.string().optional(),
  accountNumber: z.string().optional(),
  balance: z
    .number({ invalid_type_error: "Saldo deve ser número" })
    .min(0, "Saldo deve ser >= 0"),
  currency: z.string().optional().default("BRL"),
});

type FormValues = z.infer<typeof schema>;

export default function BankAccountCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<Array<{ id: string; bankName: string; alias?: string; balance?: number }>>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingBalance, setEditingBalance] = useState<string>("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      currency: "BRL",
      accountType: "corrente",
    },
  });

  const onSubmit = async (values: FormValues) => {
    try {
      const token = localStorage.getItem("token");
      await apiFetch("/bank-accounts", {
        method: "POST",
        body: JSON.stringify(values),
        token,
      });
      toast({ title: "Sucesso", description: "Conta bancária criada com sucesso!" });
      // Recarregar lista de contas após criar
      try {
        const token = localStorage.getItem("token");
        const res = await apiFetch("/bank-accounts", { token });
        setAccounts(res?.data ?? []);
      } catch {}
      navigate("/", { replace: true });
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message || "Falha ao criar conta", variant: "destructive" });
    }
  };

  useEffect(() => {
    // Carregar contas existentes para permitir edição de saldo aqui
    const token = localStorage.getItem("token");
    apiFetch("/bank-accounts", { token })
      .then((res) => setAccounts(res?.data ?? []))
      .catch(() => {});
  }, []);

  const saveBalance = async () => {
    if (!editingId) return;
    const value = Number(editingBalance);
    if (isNaN(value)) return;
    // Otimista
    setAccounts((prev) => prev.map((a) => a.id === editingId ? { ...a, balance: value } : a));
    try {
      const token = localStorage.getItem("token");
      await apiFetch(`/bank-accounts/${editingId}`,
        { method: "PUT", token, body: JSON.stringify({ balance: value }) }
      );
      const res = await apiFetch("/bank-accounts", { token });
      setAccounts(res?.data ?? []);
    } finally {
      setEditingId(null);
      setEditingBalance("");
    }
  };

  return (
    <AppLayout title="Conta Bancária" showProfile>
      <div className="w-full max-w-2xl mx-auto" data-tutorial="bank-account-create">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Cadastrar Conta Bancária</h1>
            <p className="text-sm text-muted-foreground">Informe os dados da sua conta para começar a organizar suas finanças.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="bankName">Banco</Label>
              <Input id="bankName" type="text" placeholder="Banco do Brasil" {...register("bankName")} />
              {errors.bankName && (
                <p className="text-red-600 text-sm">{errors.bankName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="alias">Apelido</Label>
              <Input id="alias" type="text" placeholder="Conta Principal" {...register("alias")} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accountType">Tipo</Label>
                <Select defaultValue={watch("accountType")} onValueChange={(v) => setValue("accountType", v)}>
                  <SelectTrigger id="accountType">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corrente">Corrente</SelectItem>
                    <SelectItem value="poupança">Poupança</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Número (mascarado)</Label>
                <Input id="accountNumber" type="text" placeholder="1234-5" {...register("accountNumber")} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="balance">Saldo Atual</Label>
                <Input id="balance" type="number" step="0.01" placeholder="0.00" {...register("balance", { valueAsNumber: true })} />
                {errors.balance && (
                  <p className="text-red-600 text-sm">{errors.balance.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Input id="currency" type="text" placeholder="BRL" {...register("currency")} onChange={(e) => setValue("currency", e.target.value.toUpperCase())} />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>

        {/* Minhas Contas: edição de saldo */}
        <Card className="p-6 mt-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Minhas Contas</h2>
            <p className="text-sm text-muted-foreground">Edite o saldo atual das contas cadastradas.</p>
          </div>
          <div className="space-y-3">
            {accounts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma conta cadastrada.</p>
            ) : (
              accounts.map((acc) => (
                <div key={acc.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>{acc.alias ? `${acc.alias} (${acc.bankName})` : acc.bankName}</span>
                    <div className="flex items-center gap-3">
                      {acc.balance != null && <span className="text-muted-foreground">{formatCurrency(Number(acc.balance))}</span>}
                      <Button variant="outline" size="sm" onClick={() => { setEditingId(acc.id); setEditingBalance(acc.balance != null ? String(acc.balance) : ""); }}>Editar saldo</Button>
                    </div>
                  </div>
                  {editingId === acc.id && (
                    <div className="flex items-center gap-2">
                      <Input type="number" step="0.01" min="0" value={editingBalance} onChange={(e) => setEditingBalance(e.target.value)} placeholder="Saldo atual" />
                      <Button size="sm" onClick={saveBalance}>Salvar</Button>
                      <Button size="sm" variant="secondary" onClick={() => { setEditingId(null); setEditingBalance(""); }}>Cancelar</Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}