import { UserId } from ".";
import { CurrencyCode } from "./currency";

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
  currency: CurrencyCode;
}

interface GroupEntity extends BaseEntity {
  currency: CurrencyCode;
}

interface BaseEntityRelation extends BaseEntity {}

interface UserGroupRelation extends BaseEntityRelation {
  admin: boolean;
  addedBy: UserId;
  balance: number;
  totalSpent: number;
}
