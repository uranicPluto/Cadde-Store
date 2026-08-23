# Technical Analysis: Milestone M2 (Commerce Discovery, Cart, Coupon & Checkout)

**Date**: 2026-08-23T04:22:00Z  
**Investigator**: Teamwork Preview Explorer M2  
**Target Milestone**: M2 (Commerce Discovery, Cart, Coupon & Checkout)  
**Authoritative Specifications**: `ORIGINAL_REQUEST.md`, `PROJECT.md`  

---

## 1. Problem Summary & Objectives

Milestone M2 requires completing the customer commerce and discovery lifecycle with **zero mock fallbacks when database data exists**:
1. **Catalog & Search Discovery**: `app/category/[slug]/page.tsx` and `app/search/page.tsx` must fetch live DB products via `fetchDbProducts` (using `/api/products`), filtering dynamically while preserving all 8 category filter presets (`women/kadin`, `men/erkek`, `electronics/elektronik`, `shoes-bags/ayakkabi-canta`, `home-living/ev-yasam`, `beauty-care/kozmetik`, `sports-outdoor/spor`, `supermarket`).
2. **Server-Authoritative Coupon Validation**: `components/cart/coupon-box.tsx` must wire coupon input directly to `POST /api/coupons/validate`, validating against the Prisma `Coupon` model (active status, expiration, minimum order subtotal, usage limit, and discount calculation).
3. **Multi-Vendor Cart & Checkout Integration**:
   - `lib/cart/cart-context.tsx` & `lib/cart/cart-types.ts` must maintain `appliedCoupon` across page navigation.
   - `app/checkout/page.tsx` must pass `couponCode: appliedCoupon?.code` to `POST /api/orders` within the atomic Prisma transaction, decrementing product stock and recording `CouponRedemption`.
   - `CheckoutSummary` must render the applied coupon discount correctly.
4. **Order Tracking & Detail Retrieval**:
   - Create `app/api/orders/[id]/route.ts` to look up order records by UUID or `orderNumber` from Prisma DB.
   - Update `app/account/orders/[id]/page.tsx` to fetch live order details from `/api/orders/[id]`, mapping `shippingAddressSnapshot`, seller groups, items, and status history with graceful fallback to client history.
5. **Product Repository Fallback Precedence**:
   - Verify `lib/catalog/product-repository.ts` so live DB products take precedence, with resilient JSON parsing for `colors`, `sizes`, and `images`.

---

## 2. File Investigation & Discrepancy Findings

### 2.1 `app/category/[slug]/page.tsx`
- **Location**: `app/category/[slug]/page.tsx:28-31`
- **Current Code**:
  ```tsx
  const fullCatalog = getFullCatalog(language);
  const categoryProducts = fullCatalog.filter((p) => isCategorySlugMatch(p.categorySlug, slug));
  ```
- **Defect**: Synchronous invocation of `getFullCatalog(language)` only reads the hardcoded mock catalog. Newly added DB products from sellers or seed scripts are never displayed.
- **Required Fix**:
  - Add state `const [products, setProducts] = useState<DetailedProductMock[]>(getFullCatalog(language));`
  - In `useEffect(() => { fetchDbProducts(language).then(prods => { if (prods?.length) setProducts(prods); }); }, [language]);`
  - Filter `products` using `isCategorySlugMatch(p.categorySlug, slug)`.
  - Maintain `<FilterSidebar categorySlug={slug} onFilterChange={handleFilterChange} />`.

### 2.2 `app/search/page.tsx`
- **Location**: `app/search/page.tsx:24-33`
- **Current Code**:
  ```tsx
  const fullCatalog = getFullCatalog(language);
  const matched = query.trim()
    ? fullCatalog.filter((p) => ...)
    : fullCatalog;
  ```
- **Defect**: Relies strictly on `getFullCatalog` instead of live database queries.
- **Required Fix**:
  - Add `useState` and `useEffect` with `fetchDbProducts(language)`.
  - Filter against `name`, `brand`, `categoryName`, `categorySlug`, and `description`.

### 2.3 `components/cart/coupon-box.tsx`
- **Location**: `components/cart/coupon-box.tsx:22-34`
- **Current Code**:
  ```tsx
  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!code.trim()) return;

    const res = validateCoupon(code, subtotal);
    if (res.valid && res.coupon) {
      onApplyCoupon(res.coupon);
      setCode("");
    } else if (res.errorMsg) {
      setErrorMsg(language === "en" ? res.errorMsg.en : res.errorMsg.tr);
    }
  };
  ```
- **Defect**: Validates against client-side array `MOCK_COUPONS` in `coupon-utils.ts` instead of calling `POST /api/coupons/validate`.
- **Required Fix**:
  - Convert `handleApply` to `async`.
  - Send `POST /api/coupons/validate` with `{ code: code.trim().toUpperCase(), subtotal }`.
  - Map the returned `{ valid: true, coupon: { code, type, value, discountAmount } }` to `Coupon` interface.
  - If validation fails, render `data.error` message in `errorMsg`.

### 2.4 `lib/cart/cart-context.tsx` & `lib/cart/cart-types.ts`
- **Defect**: Cart Context only tracks `items`. When a coupon is applied in `CartPage`, navigating to `/checkout` loses the coupon because `CartContext` lacks `appliedCoupon` and `setAppliedCoupon`.
- **Required Fix**:
  - In `lib/cart/cart-types.ts`: add `appliedCoupon: Coupon | null;` and `setAppliedCoupon: (coupon: Coupon | null) => void;` to `CartContextType`.
  - In `lib/cart/cart-context.tsx`: add `appliedCoupon` state, persist to localStorage, and reset it in `clearCart()`.
  - In `app/cart/page.tsx`: use `appliedCoupon` and `setAppliedCoupon` from `useCart()`.

### 2.5 `app/checkout/page.tsx`
- **Location**: `app/checkout/page.tsx:69, 108, 142, 225`
- **Current Code**:
  ```tsx
  const calculation = calculateOrderTotals(items, null, selectedShipping);
  ...
  body: JSON.stringify({
    items: ...,
    shippingAddress: activeAddress,
    customerInfo: customerData,
    // MISSING couponCode
  })
  ...
  appliedCoupon: null,
  ...
  <CheckoutSummary calculation={calculation} appliedCoupon={null} ... />
  ```
- **Defect**: `appliedCoupon` is hardcoded to `null` and `couponCode` is omitted from `POST /api/orders`.
- **Required Fix**:
  - Extract `appliedCoupon` from `useCart()`.
  - Pass `appliedCoupon` to `calculateOrderTotals(items, appliedCoupon, selectedShipping)`.
  - Pass `couponCode: appliedCoupon?.code` in `POST /api/orders` body.
  - Pass `appliedCoupon` to `CheckoutSummary`.

### 2.6 `app/api/orders/[id]/route.ts` (New Route Handler)
- **Defect**: Does not exist. Requests for order lookup by ID currently 404.
- **Required Fix**:
  - Create `app/api/orders/[id]/route.ts` with `GET` handler.
  - Queries `prisma.order.findFirst` matching `id` or `orderNumber`.
  - Includes `customer`, `orderItems.product`, `orderGroups.seller`, `orderGroups.items.product`, `statusHistory`.

### 2.7 `app/account/orders/[id]/page.tsx`
- **Location**: `app/account/orders/[id]/page.tsx:28-32`
- **Current Code**:
  ```tsx
  useEffect(() => {
    const orders = getSavedOrders();
    const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
    if (found) setOrder(found);
  }, [id]);
  ```
- **Defect**: Only inspects local storage, ignoring live orders created via `POST /api/orders` in Prisma DB.
- **Required Fix**:
  - Fetch from `/api/orders/${id}`.
  - Map DB response to `OrderRecord`.
  - Graceful fallback to `getSavedOrders()` if offline or not found.

### 2.8 `lib/catalog/product-repository.ts`
- **Location**: `lib/catalog/product-repository.ts:47-101, 1442-1466`
- **Analysis**:
  - `fetchDbProducts` properly calls `/api/products` and maps products with `mapDbProductToMock`.
  - `mapDbProductToMock` needs safe guards so `colors`, `sizes`, and `images` parse correctly whether they arrive as JSON string or parsed array.

---

## 3. Step-by-Step Implementation Strategy for Worker

### Step 1: Update `lib/catalog/product-repository.ts`
1. In `mapDbProductToMock`:
   ```ts
   let colors: string[] = [];
   let sizes: string[] = [];
   let images: string[] = [dbProd.imageUrl];

   if (Array.isArray(dbProd.colors)) {
     colors = dbProd.colors;
   } else if (typeof dbProd.colors === "string") {
     try { colors = JSON.parse(dbProd.colors); } catch(e) {}
   }

   if (Array.isArray(dbProd.sizes)) {
     sizes = dbProd.sizes;
   } else if (typeof dbProd.sizes === "string") {
     try { sizes = JSON.parse(dbProd.sizes); } catch(e) {}
   }

   if (Array.isArray(dbProd.images)) {
     images = dbProd.images;
   } else if (typeof dbProd.images === "string") {
     try { images = JSON.parse(dbProd.images); } catch(e) {}
   }
   if (!images || images.length === 0) images = [dbProd.imageUrl];
   ```
2. Verify `fetchDbProducts(lang)` and `fetchDbProductBySlug(slug, lang)`.

### Step 2: Update `app/category/[slug]/page.tsx`
1. Import `useEffect` from `"react"`.
2. Import `fetchDbProducts` from `@/lib/catalog/product-repository`.
3. Add state:
   ```tsx
   const [products, setProducts] = useState<DetailedProductMock[]>(getFullCatalog(language));

   useEffect(() => {
     let isMounted = true;
     fetchDbProducts(language).then((dbProds) => {
       if (isMounted && Array.isArray(dbProds) && dbProds.length > 0) {
         setProducts(dbProds);
       }
     });
     return () => { isMounted = false; };
   }, [language]);
   ```
4. Filter products:
   ```tsx
   const categoryProducts = products.filter((p) => isCategorySlugMatch(p.categorySlug, slug));
   ```
5. Pass `categorySlug={slug}` to `<FilterSidebar categorySlug={slug} onFilterChange={handleFilterChange} />`.
6. Compute `filtered = filterProducts(categoryProducts, filterCriteria)` and `finalProducts = sortProducts(filtered, sortOption)`.

### Step 3: Update `app/search/page.tsx`
1. In `SearchContent`:
   ```tsx
   const [products, setProducts] = useState<DetailedProductMock[]>(getFullCatalog(language));

   useEffect(() => {
     let isMounted = true;
     fetchDbProducts(language).then((dbProds) => {
       if (isMounted && Array.isArray(dbProds) && dbProds.length > 0) {
         setProducts(dbProds);
       }
     });
     return () => { isMounted = false; };
   }, [language]);

   const qLower = query.toLowerCase().trim();
   const matched = qLower
     ? products.filter(
         (p) =>
           p.name.toLowerCase().includes(qLower) ||
           p.brand.toLowerCase().includes(qLower) ||
           p.categoryName.toLowerCase().includes(qLower) ||
           (p.categorySlug && p.categorySlug.toLowerCase().includes(qLower)) ||
           (p.description && p.description.toLowerCase().includes(qLower))
       )
     : products;
   ```
2. Compute `filtered = filterProducts(matched, filterCriteria)` and `finalProducts = sortProducts(filtered, sortOption)`.

### Step 4: Wire `components/cart/coupon-box.tsx` to `POST /api/coupons/validate`
1. Add `const [isLoading, setIsLoading] = useState(false);`
2. Update `handleApply`:
   ```tsx
   const handleApply = async (e: React.FormEvent) => {
     e.preventDefault();
     setErrorMsg(null);
     const cleanCode = code.trim().toUpperCase();
     if (!cleanCode) return;

     setIsLoading(true);
     try {
       const res = await fetch("/api/coupons/validate", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ code: cleanCode, subtotal }),
       });

       const data = await res.json();

       if (res.ok && data.valid && data.coupon) {
         const couponObj: Coupon = {
           code: data.coupon.code,
           discountType: data.coupon.type === "PERCENTAGE" ? "percentage" : "fixed",
           value: data.coupon.value,
           description: {
             tr: data.coupon.type === "PERCENTAGE"
               ? `%${data.coupon.value} İndirim Kuponu`
               : `${data.coupon.value} TL İndirim Kuponu`,
             en: data.coupon.type === "PERCENTAGE"
               ? `${data.coupon.value}% Discount Coupon`
               : `${data.coupon.value} TL Discount Coupon`,
           },
         };
         onApplyCoupon(couponObj);
         setCode("");
       } else {
         setErrorMsg(data.error || (language === "en" ? "Invalid coupon code." : "Geçersiz kupon kodu."));
       }
     } catch (err) {
       // Graceful local validation fallback
       const localRes = validateCoupon(cleanCode, subtotal);
       if (localRes.valid && localRes.coupon) {
         onApplyCoupon(localRes.coupon);
         setCode("");
       } else if (localRes.errorMsg) {
         setErrorMsg(language === "en" ? localRes.errorMsg.en : localRes.errorMsg.tr);
       } else {
         setErrorMsg(language === "en" ? "Failed to validate coupon." : "Kupon doğrulanırken hata oluştu.");
       }
     } finally {
       setIsLoading(false);
     }
   };
   ```

### Step 5: Update Cart Context & `app/cart/page.tsx`
1. In `lib/cart/cart-types.ts`:
   ```ts
   import { Coupon } from "./coupon-utils";

   export interface CartContextType {
     items: CartItem[];
     appliedCoupon: Coupon | null;
     setAppliedCoupon: (coupon: Coupon | null) => void;
     ...
   }
   ```
2. In `lib/cart/cart-context.tsx`:
   - Add state: `const [appliedCoupon, setAppliedCouponState] = useState<Coupon | null>(null);`
   - In `clearCart()`: `saveCart([]); setAppliedCoupon(null);`
   - Provide `appliedCoupon` and `setAppliedCoupon` in `CartContext.Provider`.
3. In `app/cart/page.tsx`:
   - Replace local `useState` coupon with `const { items, updateQuantity, removeFromCart, totalCount, subtotal, appliedCoupon, setAppliedCoupon } = useCart();`

### Step 6: Update `app/checkout/page.tsx`
1. Consume `appliedCoupon` from `useCart()`:
   ```tsx
   const { items, clearCart, appliedCoupon } = useCart();
   ```
2. Compute totals:
   ```tsx
   const calculation = calculateOrderTotals(items, appliedCoupon, selectedShipping);
   ```
3. In `handlePlaceOrder`:
   ```tsx
   const apiRes = await fetch("/api/orders", {
     method: "POST",
     headers: { "Content-Type": "application/json" },
     body: JSON.stringify({
       items: items.map((i) => ({
         id: i.id,
         quantity: i.quantity,
         selectedColor: i.selectedColor,
         selectedSize: i.selectedSize,
         product: i.product,
       })),
       shippingAddress: activeAddress,
       customerInfo: customerData,
       couponCode: appliedCoupon?.code,
     }),
   });
   ```
4. In `orderRecord`:
   ```tsx
   appliedCoupon: appliedCoupon,
   ```
5. In `CheckoutSummary`:
   ```tsx
   <CheckoutSummary
     calculation={calculation}
     appliedCoupon={appliedCoupon}
     selectedAddress={addresses.find((a) => a.id === selectedAddressId)}
     selectedShippingMethod={selectedShipping}
     isSubmitting={isSubmitting}
     onPlaceOrder={handlePlaceOrder}
   />
   ```

### Step 7: Create `app/api/orders/[id]/route.ts`
1. Create file `app/api/orders/[id]/route.ts`:
   ```ts
   import { NextResponse } from "next/server";
   import { prisma } from "@/lib/db/prisma";
   import { getSession } from "@/lib/auth/session";

   export const dynamic = "force-dynamic";

   export async function GET(request: Request, { params }: { params: { id: string } }) {
     try {
       const session = await getSession();
       const orderId = params.id;

       const order = await prisma.order.findFirst({
         where: {
           OR: [{ id: orderId }, { orderNumber: orderId }],
           ...(session?.role !== "ADMIN" && session?.id ? { customerId: session.id } : {}),
         },
         include: {
           customer: true,
           orderItems: { include: { product: true } },
           orderGroups: { include: { seller: true, items: { include: { product: true } } } },
           statusHistory: { orderBy: { createdAt: "asc" } },
         },
       });

       if (!order) {
         // Guest / unauthenticated fallback lookup
         const guestOrder = await prisma.order.findFirst({
           where: { OR: [{ id: orderId }, { orderNumber: orderId }] },
           include: {
             customer: true,
             orderItems: { include: { product: true } },
             orderGroups: { include: { seller: true, items: { include: { product: true } } } },
             statusHistory: { orderBy: { createdAt: "asc" } },
           },
         });

         if (!guestOrder) {
           return NextResponse.json({ error: "Sipariş bulunamadı." }, { status: 404 });
         }
         return NextResponse.json({ order: guestOrder });
       }

       return NextResponse.json({ order });
     } catch (error) {
       console.error("GET Order by ID error:", error);
       return NextResponse.json({ error: "Sipariş bilgisi getirilemedi." }, { status: 500 });
     }
   }
   ```

### Step 8: Update `app/account/orders/[id]/page.tsx`
1. Fetch from `/api/orders/${id}` inside `useEffect`:
   ```tsx
   useEffect(() => {
     if (!id) return;
     let isMounted = true;

     fetch(`/api/orders/${encodeURIComponent(id)}`)
       .then((res) => {
         if (!res.ok) throw new Error("Order not found");
         return res.json();
       })
       .then((data) => {
         if (!isMounted || !data.order) return;
         const o = data.order;
         let shippingAddress: any = {};
         try {
           shippingAddress = typeof o.shippingAddressSnapshot === "string"
             ? JSON.parse(o.shippingAddressSnapshot)
             : (o.shippingAddressSnapshot || {});
         } catch (e) {}

         const dbMapped: OrderRecord = {
           orderId: o.id,
           orderNumber: o.orderNumber,
           createdAt: o.createdAt,
           customerInfo: {
             firstName: o.customer?.firstName || shippingAddress.firstName || "Müşteri",
             lastName: o.customer?.lastName || shippingAddress.lastName || "",
             email: o.customer?.email || shippingAddress.email || "",
             phone: o.customer?.phone || shippingAddress.phone || "",
           },
           shippingAddress: {
             id: shippingAddress.id || "addr-snapshot",
             title: shippingAddress.title || "Teslimat Adresi",
             firstName: shippingAddress.firstName || o.customer?.firstName || "Müşteri",
             lastName: shippingAddress.lastName || o.customer?.lastName || "",
             phone: shippingAddress.phone || o.customer?.phone || "",
             email: shippingAddress.email || o.customer?.email || "",
             city: shippingAddress.city || "İstanbul",
             district: shippingAddress.district || "Kadıköy",
             addressLine: shippingAddress.addressLine || "",
             country: shippingAddress.country || "Türkiye",
           },
           shippingMethod: {
             id: "std",
             name: { tr: o.carrierName || "Yurtiçi Kargo", en: o.carrierName || "Yurtiçi Kargo" },
             deliveryDays: { tr: "1-2 Gün", en: "1-2 Days" },
             price: o.shippingFee || 0,
           },
           sellerGroups: Array.isArray(o.orderGroups) && o.orderGroups.length > 0
             ? o.orderGroups.map((g: any) => ({
                 sellerId: g.sellerId,
                 storeName: g.seller?.storeName || "Cadde Store Mağazası",
                 items: Array.isArray(g.items) && g.items.length > 0
                   ? g.items.map((item: any) => ({
                       id: item.id,
                       product: {
                         id: item.product?.id || item.productId,
                         slug: item.product?.slug || item.productId,
                         name: item.product?.name || "Ürün",
                         brand: item.product?.brand || "Cadde Store",
                         categorySlug: "general",
                         categoryName: "Genel",
                         storeName: g.seller?.storeName || "Mağaza",
                         price: item.price,
                         rating: 4.8,
                         reviewCount: 10,
                         imageUrl: item.product?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
                         galleryImages: [],
                         description: "",
                         specifications: {},
                         stock: 10,
                         reviews: [],
                       },
                       quantity: item.quantity,
                       selectedColor: item.selectedColor,
                       selectedSize: item.selectedSize,
                     }))
                   : Array.isArray(o.orderItems)
                   ? o.orderItems
                       .filter((item: any) => item.orderGroupId === g.id || !item.orderGroupId)
                       .map((item: any) => ({
                         id: item.id,
                         product: {
                           id: item.product?.id || item.productId,
                           slug: item.product?.slug || item.productId,
                           name: item.product?.name || "Ürün",
                           brand: item.product?.brand || "Cadde Store",
                           categorySlug: "general",
                           categoryName: "Genel",
                           storeName: g.seller?.storeName || "Mağaza",
                           price: item.price,
                           rating: 4.8,
                           reviewCount: 10,
                           imageUrl: item.product?.imageUrl || "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=400&q=80",
                           galleryImages: [],
                           description: "",
                           specifications: {},
                           stock: 10,
                           reviews: [],
                         },
                         quantity: item.quantity,
                         selectedColor: item.selectedColor,
                         selectedSize: item.selectedSize,
                       }))
                   : [],
                 subtotal: g.subtotal,
                 freeShippingThreshold: 500,
                 shippingFee: 0,
                 isFreeShipping: true,
                 status: g.status.toLowerCase(),
               }))
             : [],
           appliedCoupon: null,
           paymentMethod: o.paymentMethod || "credit_card",
           trackingNumber: o.trackingNumber,
           estimatedDelivery: o.estimatedDelivery,
           statusHistory: Array.isArray(o.statusHistory) && o.statusHistory.length > 0
             ? o.statusHistory.map((sh: any) => ({
                 status: sh.status.toLowerCase(),
                 date: new Date(sh.createdAt).toLocaleString(language === "en" ? "en-US" : "tr-TR"),
                 description: sh.note || sh.status,
                 completed: true,
               }))
             : undefined,
           calculation: {
             subtotal: o.subtotal,
             productDiscount: o.productDiscount,
             couponDiscount: o.couponDiscount,
             totalShipping: o.shippingFee,
             grandTotal: o.grandTotal,
             sellerGroups: [],
           },
           status: o.status.toLowerCase() as any,
         };
         setOrder(dbMapped);
       })
       .catch(() => {
         if (!isMounted) return;
         const orders = getSavedOrders();
         const found = orders.find((o) => o.orderNumber === id || o.orderId === id) || orders[0];
         if (found) setOrder(found);
       });

     return () => { isMounted = false; };
   }, [id, language]);
   ```

---

## 4. Verification & Testing Method

1. **Category Discovery Test**:
   - Seed the database (`npx prisma db seed`).
   - Navigate to `/category/men` and `/category/women` and `/category/electronics`.
   - Verify that live database products appear with proper prices, images, ratings, and badges.
   - Verify that all 8 category filter presets (`women/kadin`, `men/erkek`, `electronics/elektronik`, `shoes-bags/ayakkabi-canta`, `home-living/ev-yasam`, `beauty-care/kozmetik`, `sports-outdoor/spor`, `supermarket`) apply without errors.
2. **Search Discovery Test**:
   - Query `/search?q=Oversize` and `/search?q=Apple` and `/search?q=Zara`.
   - Verify that matching DB products appear.
3. **Coupon Validation Test**:
   - Add items to cart totaling > 150 TL.
   - On `/cart`, enter coupon `CADDE10` and click "Uygula".
   - Verify network call `POST /api/coupons/validate` returning status 200 and discount calculation.
   - Verify that invalid codes return error toast/text.
4. **Checkout Integration Test**:
   - Proceed to `/checkout`.
   - Verify that the applied coupon `CADDE10` is visible in `CheckoutSummary` with correct discount deduction.
   - Complete checkout with shipping address and card details.
   - Verify network call `POST /api/orders` receiving `couponCode: "CADDE10"`, creating `Order` and `OrderGroup` records in DB, decrementing stock, and creating `CouponRedemption`.
5. **Order Detail Test**:
   - Navigate to `/account/orders/[id]` where `[id]` is the newly created orderNumber (e.g. `CS-123456`).
   - Verify that `/api/orders/[id]` responds with HTTP 200 and renders full tracking, address snapshot, and seller items.
6. **Build Verification**:
   - Run `npm run build` to confirm 0 compilation or linting errors.
