import { Currency, Dinero } from "dinero.js";

import { UserId } from ".";

enum CostCategory {
  BILLS = "Bills",
  CHARITY = "Charity",
  EATING_OUT = "Eating out",
  ENTERTAINMENT = "Entertainment",
  EXPENSES = "Expenses",
  FITNESS = "Fitness",
  GENERAL = "General",
  GIFTS = "Gifts",
  GROCERIES = "Groceries",
  HEALTH = "Health",
  HOLIDAYS = "Holidays",
  SHOPPING = "Shopping",
  TRANSPORT = "Transport",
}

interface Cost {
  id: string;
  createdAt: number;
  updatedAt: number;
  name: string;
  amount: number;
  groupId: string;
  paidBy: UserId;
  paidFor: UserId;
  updatedBy: UserId;
  category: CostCategory;
  currency: Currency;
  exchangeRate: number;
}
