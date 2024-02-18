import { Currency } from "dinero.js";

import { UserId } from ".";

type EntityType = "USER" | "GROUP" | "USER_GROUP_RELATION";

interface BaseEntity {
  id: string;
  entityId: string;
  createdAt: number;
  updatedAt: number;
  entityType: EntityType;
  name: string;
}

interface UserEntity extends BaseEntity {
  defaultCurrency: Currency;
}

interface GroupEntity extends BaseEntity {
  targetCurrency: Currency;
}

interface BaseEntityRelation extends BaseEntity {}

interface UserGroupRelation extends BaseEntityRelation {
  admin: boolean;
  addedBy: UserId;
  balance: number;
  totalSpent: number;
}

// 2. define entities table with GSIs
// 3. define costs table with GSIs
// 4. look into serialisation/deserialisation method
