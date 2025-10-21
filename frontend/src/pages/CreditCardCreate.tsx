import { useEffect, useState } from "react";
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

const schema = z.object({
  issuer: z.string().min(1, "Emissor é obrigatório"),
  last4: z.string().length(4, "Informe exatamente 4 dígitos"),
  limit: z
    .number({ invalid_type_error: "Limite deve ser número" })
    .min(0, "Limite deve ser >= 0"),
  statementDay: z
    .number({ invalid_type_error: "Dia da fatura deve ser número" })
    .min(1)
    .max(31),
  dueDay: z
    .number({ invalid_type_error: "Dia de vencimento deve ser número" })
    .min(1)
    .max(31),
  bankAccountId: z.string().min(1, "Conta associada é obrigatória"),
});

type FormValues = z.infer<typeof schema>;

interface BankAccountOption {
  id: string;
  bankName: string;
  alias?: string;
}

export default function CreditCardCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<BankAccountOption[]>([]);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    apiFetch("/bank-accounts", { token })
      .then((res) => {
        const list = (res?.data ?? []) as any[];
        setAccounts(
          list.map((a) => ({ id: a.id, bankName: a.bankName ?? a.name ?? "", alias: a.alias }))
        );
      })
      .catch((err) => {
        console.error(err);
        toast({ title: "Erro", description: "Falha ao carregar contas bancárias", variant: "destructive" });
      });
  }, [toast]);

  const onSubmit = async (values: FormValues) => {
    try {
      const token = localStorage.getItem("token");
      await apiFetch("/credit-cards", {
        method: "POST",
        body: JSON.stringify(values),
        token,
      });
      toast({ title: "Sucesso", description: "Cartão criado com sucesso!" });
      navigate("/", { replace: true });
    } catch (err) {
      toast({ title: "Erro", description: (err as Error).message || "Falha ao criar cartão", variant: "destructive" });
    }
  };

  return (
    <AppLayout title="Cartão de Crédito" showProfile>
      <div className="w-full max-w-2xl mx-auto">
        <Card className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Cadastrar Cartão de Crédito</h1>
            <p className="text-sm text-muted-foreground">Cadastre seu cartão para acompanhar fatura, vencimento e gastos.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="issuer">Emissor</Label>
              <Input id="issuer" type="text" placeholder="Nubank, Itaú, Visa..." {...register("issuer")} />
              {errors.issuer && (
                <p className="text-red-600 text-sm">{errors.issuer.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="last4">Últimos 4 dígitos</Label>
                <Input id="last4" type="text" maxLength={4} placeholder="1234" {...register("last4")} />
                {errors.last4 && (
                  <p className="text-red-600 text-sm">{errors.last4.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit">Limite</Label>
                <Input id="limit" type="number" step="0.01" placeholder="1000.00" {...register("limit", { valueAsNumber: true })} />
                {errors.limit && (
                  <p className="text-red-600 text-sm">{errors.limit.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="statementDay">Dia da fatura</Label>
                <Input id="statementDay" type="number" min={1} max={31} placeholder="1-31" {...register("statementDay", { valueAsNumber: true })} />
                {errors.statementDay && (
                  <p className="text-red-600 text-sm">{errors.statementDay.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="dueDay">Dia de vencimento</Label>
                <Input id="dueDay" type="number" min={1} max={31} placeholder="1-31" {...register("dueDay", { valueAsNumber: true })} />
                {errors.dueDay && (
                  <p className="text-red-600 text-sm">{errors.dueDay.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankAccountId">Conta Bancária Associada</Label>
              <Select onValueChange={(v) => setValue("bankAccountId", v, { shouldValidate: true })}>
                <SelectTrigger id="bankAccountId">
                  <SelectValue placeholder="Selecione uma conta" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((acc) => (
                    <SelectItem key={acc.id} value={acc.id}>
                      {acc.alias ? `${acc.alias} (${acc.bankName})` : acc.bankName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Hidden field para registro do RHF */}
              <input type="hidden" {...register("bankAccountId")} />
              {errors.bankAccountId && (
                <p className="text-red-600 text-sm">{errors.bankAccountId.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => navigate(-1)}>Cancelar</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Salvando..." : "Salvar"}</Button>
            </div>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}