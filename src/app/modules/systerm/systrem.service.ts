import { prisma } from "../../shared/Prisma";

export const SystemService = {
  async cleanupOldData() {
    const now = new Date();

    const checkoutDraftBefore = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const cartBefore = new Date(
      now.getTime() - 30 * 24 * 60 * 60 * 1000
    );

    const manualPaymentBefore = new Date(
      now.getTime() - 7 * 24 * 60 * 60 * 1000
    );

    const deletedDrafts = await prisma.checkoutDraft.deleteMany({
      where: {
        createdAt: {
          lt: checkoutDraftBefore,
        },
      },
    });

    const deletedCarts = await prisma.cart.deleteMany({
      where: {
        updatedAt: {
          lt: cartBefore,
        },
      },
    });

    const deletedManualPayments = await prisma.manualPaymentSubmission.deleteMany({
      where: {
        verificationStatus: "PENDING",
        createdAt: {
          lt: manualPaymentBefore,
        },
      },
    });

    return {
      deletedDrafts: deletedDrafts.count,
      deletedCarts: deletedCarts.count,
      deletedManualPayments: deletedManualPayments.count,
    };
  },
};