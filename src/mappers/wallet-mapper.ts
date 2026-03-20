import { GetAllWallets200Response, Wallet as RestWallet, WalletTypeEnum } from "@clients";
import { Wallet as PrismaWallet } from "@prisma/client";
import { v4 } from "uuid";

import { PrismaPaginationInfo } from "@/types";
import { calculatePagination, copyObject } from "@/utilities";

export class WalletMapper {
  public static toRest(wallet: PrismaWallet) {
    const mapped: RestWallet = {
      id: wallet.id,
      name: wallet.name,
      amount: wallet.amount,
      color:wallet.color,
      iconRef:wallet.iconRef,
      isActive: wallet.isActive,
      accountId: wallet.accountId,
      description: wallet.description,
      type: wallet.type as WalletTypeEnum,
      walletAutomaticIncome: {
        amount: wallet.automaticIncomeAmount,
        paymentDay: wallet.automaticIncomeDay,
        type: wallet.haveAutomaticIncome ? "MENSUAL" : "NOT_SPECIFIED",
      },
      isArchived: wallet.isArchived,
    };
    return mapped;
  }

  public static toDomain(wallet: RestWallet): PrismaWallet {
    const mapped = {
      accountId: wallet.accountId || "",
      amount: wallet.amount || 0,
      description: wallet.description || "",
      color:wallet.color || "00ff00",
      iconRef:wallet.iconRef || "wallet",
      id: wallet.id || "",
      name: wallet.name || "",
      isActive: !!wallet.isActive,
      type: wallet.type || "",
      isArchived: wallet.isArchived || false
    };
    return mapped as PrismaWallet;
  }

  public static create(accountId: string, wallet: RestWallet): PrismaWallet {
    const mapped = {
      accountId,
      amount: wallet.amount || 0,
      description: wallet.description || "",
      color:wallet.color || "00ff00",
      iconRef:wallet.iconRef || "wallet",
      id: v4(),
      name: wallet.name || "",
      isActive: !!wallet.isActive,
      type: wallet.type || "",
      isArchived: false
    };
    return mapped as PrismaWallet;
  }

  public static update(accountId: string, wallet: RestWallet): PrismaWallet {
    const mapped = copyObject(wallet);
    delete mapped.amount;
    mapped.accountId = accountId;
    return mapped as PrismaWallet;
  }

  public static toListResponse(wallets: PrismaWallet[], prismaPaginationInfo: PrismaPaginationInfo) {
    const mapped = wallets.map(this.toRest.bind(this));
    const listResponse: GetAllWallets200Response = {
      pagination: calculatePagination(prismaPaginationInfo),
      values: mapped,
    };

    return listResponse;
  }
}
