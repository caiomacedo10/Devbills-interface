import type { TransactionType } from "./transactions";

export interface Category {
  id: string; // Identificador único da categoria
  name: string; // Nome da categoria
  color: string; // Cor da categoria

  type: TransactionType; // Tipo de transação (expense ou income)
}

export interface CategorySummary {
  categoryId: string; // ID da categoria
  categoryName: string; // Nome da categoria
  categoryColor: string; // Cor da categoria
  amount: number; // Valor total das transações dessa categoria
  percentage: number; // Porcentagem do total de despesas
}
