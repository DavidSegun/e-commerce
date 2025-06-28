import { stripe } from "@/lib/stripe";
import config from "@payload-config";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import type { Stripe } from "stripe";

export async function POST(req: Request) {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      await req.text(),
      req.headers.get("stripe-signature") as string,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    if (error instanceof Error) {
      console.log(error);
    }
    console.log(`‼️ Error message : ${errorMessage}`);
    return NextResponse.json(
      { message: `Webhook Error: ${errorMessage}` },
      { status: 400 }
    );
  }
  console.log("✅ Success:", event.id);

  const permittedEvents: string[] = [
    "checkout.session.completed",
    "account.updated",
  ];

  const payload = await getPayload({ config });

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const data = event.data.object as Stripe.Checkout.Session;

          console.log("ACCOUNT: ", {
            account: event.account,
          });

          if (!data.metadata?.userId) {
            throw new Error("User ID is required");
          }

          const user = await payload.findByID({
            collection: "users",
            id: data.metadata.userId,
          });

          if (!user) {
            throw new Error("User not found");
          }

          const expandedSession = await stripe.checkout.sessions.retrieve(
            data.id,
            {
              expand: ["line_items.data.price.product"],
            },
            {
              stripeAccount: event.account,
            }
          );

          if (
            !expandedSession.line_items?.data ||
            !expandedSession.line_items.data.length
          ) {
            throw new Error("No line items found");
          }

          const lineItems = expandedSession.line_items.data;

          for (const item of lineItems) {
            const product = item.price?.product as Stripe.Product;
            if (!product?.metadata?.id || !product?.metadata?.name) {
              console.error("Product metadata missing:", product);
              throw new Error("Missing required metadata on Stripe product");
            }

            await payload.create({
              collection: "orders",
              data: {
                stripeCheckoutSessionId: data.id,
                stripeAccountId: event.account,
                user: user.id,
                book: product.metadata.id,
                name: product.metadata.name,
              },
            });
          }
          break;
        }
        case "account.updated": {
          const data = event.data.object as Stripe.Account;
          await payload.update({
            collection: "tenants",
            where: {
              stripeAccountId: {
                equals: data.id,
              },
            },
            data: {
              stripeDetailsSubmitted: data.details_submitted,
            },
          });
          break;
        }
        default:
          throw new Error(`Unhandled event: ${event.type}`);
      }
    } catch (error) {
      console.log("Webhook error:", error);
      return NextResponse.json(
        { message: "Webhook handler failed" },
        { status: 500 }
      );
    }
  }
  return NextResponse.json({ message: "Received" }, { status: 200 });
}
