"use client";

import { useState } from "react";
import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getProductsForSorting,
  updateProductsOrder,
  Product,
} from "../../../../../../services/apiProducts";
import toast from "react-hot-toast";
import Image from "next/image";

interface SortableProductItemProps {
  product: Product;
}

function SortableProductItem({ product }: SortableProductItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: product.id! });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white dark:bg-[#0c1427] border border-gray-200 dark:border-[#172036] rounded-lg p-4 mb-3 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-4 rtl:space-x-reverse">
        {/* Drag Handle */}
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          <i className="material-symbols-outlined text-2xl">drag_indicator</i>
        </div>

        {/* Product Image */}
        <div className="flex-shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.title_ar}
              width={60}
              height={60}
              className="rounded-lg object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "/placeholder.png";
              }}
            />
          ) : (
            <div className="w-[60px] h-[60px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
              <i className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                image
              </i>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
            {product.title_ar}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
            {product.title_en}
          </p>
          <div className="mt-1">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ترتيب: {product.sort_order || 0}
            </span>
          </div>
        </div>

        {/* Drag Icon */}
        <div className="flex-shrink-0 text-gray-400 dark:text-gray-500">
          <i className="material-symbols-outlined">drag_handle</i>
        </div>
      </div>
    </div>
  );
}

export default function SortProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [originalProducts, setOriginalProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["products-for-sorting"],
    queryFn: getProductsForSorting,
  });

  // Update local state when data is loaded
  React.useEffect(() => {
    if (productsData) {
      setProducts(productsData);
      setOriginalProducts(productsData);
      setFilteredProducts(productsData);
    }
  }, [productsData]);

  // Filter products based on search term
  React.useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products);
    } else {
      const searchLower = searchTerm.toLowerCase();
      const filtered = products.filter(
        (product) =>
          product.title_ar.toLowerCase().includes(searchLower) ||
          product.title_en.toLowerCase().includes(searchLower)
      );

      // Sort to show exact matches first, then partial matches
      const sorted = filtered.sort((a, b) => {
        const aTitleAr = a.title_ar.toLowerCase();
        const aTitleEn = a.title_en.toLowerCase();
        const bTitleAr = b.title_ar.toLowerCase();
        const bTitleEn = b.title_en.toLowerCase();

        // Check for exact matches first
        const aExactMatch =
          aTitleAr === searchLower || aTitleEn === searchLower;
        const bExactMatch =
          bTitleAr === searchLower || bTitleEn === searchLower;

        if (aExactMatch && !bExactMatch) return -1;
        if (!aExactMatch && bExactMatch) return 1;

        // Check for starts with matches
        const aStartsWith =
          aTitleAr.startsWith(searchLower) || aTitleEn.startsWith(searchLower);
        const bStartsWith =
          bTitleAr.startsWith(searchLower) || bTitleEn.startsWith(searchLower);

        if (aStartsWith && !bStartsWith) return -1;
        if (!aStartsWith && bStartsWith) return 1;

        // Keep original order for other matches
        return 0;
      });

      setFilteredProducts(sorted);
    }
  }, [searchTerm, products]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setProducts((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSaveOrder = async () => {
    try {
      setIsUpdating(true);

      // Find products that have changed position
      const changedProducts = products.filter((product, index) => {
        const originalProduct = originalProducts.find(
          (p) => p.id === product.id
        );
        if (!originalProduct) return true; // New product
        return originalProduct.sort_order !== index + 1;
      });

      if (changedProducts.length === 0) {
        toast.success("لم يتم تغيير ترتيب أي منتج");
        return;
      }

      // Update sort_order only for changed products
      const updatedProducts = changedProducts.map((product) => {
        const newIndex = products.findIndex((p) => p.id === product.id);
        return {
          id: product.id!,
          sort_order: newIndex + 1,
        };
      });

      await updateProductsOrder(updatedProducts);

      // Update local state with new sort_order values
      setProducts((prevProducts) =>
        prevProducts.map((product, index) => ({
          ...product,
          sort_order: index + 1,
        }))
      );

      // Update original products to reflect the new state
      setOriginalProducts(
        products.map((product, index) => ({
          ...product,
          sort_order: index + 1,
        }))
      );

      // Invalidate and refetch products query
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["products-for-sorting"] });

      toast.success(`تم حفظ ترتيب ${changedProducts.length} منتج بنجاح`);
    } catch (error) {
      console.error("خطأ في حفظ ترتيب المنتجات:", error);
      toast.error("حدث خطأ أثناء حفظ ترتيب المنتجات");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetOrder = () => {
    if (productsData) {
      setProducts([...productsData]);
      setOriginalProducts([...productsData]);
      setFilteredProducts([...productsData]);
      toast.success("تم إعادة تعيين الترتيب");
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="material-symbols-outlined text-4xl text-primary-500 animate-spin mb-4">
            sync
          </i>
          <p className="text-gray-600 dark:text-gray-400">
            جاري تحميل المنتجات...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <i className="material-symbols-outlined text-4xl text-red-500 mb-4">
            error
          </i>
          <p className="text-red-600 dark:text-red-400">
            حدث خطأ أثناء تحميل المنتجات
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-header mb-[20px] md:mb-[25px]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="trezo-card-title">
              <h5 className="!mb-0">ترتيب المنتجات</h5>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                اسحب وأفلت المنتجات لترتيبها حسب الأولوية
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Input */}
              {/* <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <i className="material-symbols-outlined text-gray-400 dark:text-gray-500">
                    search
                  </i>
                </div>
                <input
                  type="text"
                  placeholder="البحث بالاسم..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-[40px] rounded-md text-black dark:text-white border border-gray-200 dark:border-[#172036] bg-white dark:bg-[#0c1427] pl-[17px] pr-[40px] block w-full outline-0 transition-all placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-primary-500"
                />
                {searchTerm && (
                  <button
                    onClick={handleClearSearch}
                    className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <i className="material-symbols-outlined text-sm">close</i>
                  </button>
                )}
              </div> */}

              {/* Action Buttons */}
              <div className="flex space-x-3 rtl:space-x-reverse">
                <button
                  onClick={handleResetOrder}
                  disabled={isUpdating}
                  className="ml-5 font-medium inline-block transition-all rounded-md text-sm py-[8px] px-[16px] bg-gray-500 text-white hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2 text-sm">
                    refresh
                  </i>
                  إعادة تعيين
                </button>
                <button
                  onClick={handleSaveOrder}
                  disabled={isUpdating}
                  className="font-medium inline-block transition-all rounded-md text-sm py-[8px] px-[16px] bg-primary-500 text-white hover:bg-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUpdating ? (
                    <>
                      <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2 text-sm animate-spin">
                        sync
                      </i>
                      جاري الحفظ...
                    </>
                  ) : (
                    <>
                      <i className="material-symbols-outlined ltr:mr-2 rtl:ml-2 text-sm">
                        save
                      </i>
                      حفظ الترتيب
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products List */}
      <div className="trezo-card bg-white dark:bg-[#0c1427] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-content">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <i className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4">
                inventory_2
              </i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد منتجات
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لا توجد منتجات متاحة للترتيب
              </p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <i className="material-symbols-outlined text-6xl text-gray-400 dark:text-gray-500 mb-4">
                search_off
              </i>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                لا توجد نتائج
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                لم يتم العثور على منتجات تطابق البحث
              </p>
              <button
                onClick={handleClearSearch}
                className="mt-4 text-primary-500 hover:text-primary-600 font-medium"
              >
                مسح البحث
              </button>
            </div>
          ) : (
            <>
              {/* Search Results Info */}
              {searchTerm && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    عرض {filteredProducts.length} من أصل {products.length} منتج
                    {searchTerm && ` للبحث: "${searchTerm}"`}
                  </p>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={filteredProducts
                    .map((product) => product.id!)
                    .filter(Boolean)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <SortableProductItem key={product.id} product={product} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="trezo-card bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-[20px] md:p-[25px] rounded-md">
        <div className="flex items-start space-x-3 rtl:space-x-reverse">
          <i className="material-symbols-outlined text-blue-500 text-xl mt-1">
            info
          </i>
          <div>
            <h4 className="text-blue-900 dark:text-blue-100 font-medium mb-2">
              تعليمات الترتيب
            </h4>
            <ul className="text-blue-800 dark:text-blue-200 text-sm space-y-1">
              <li>• استخدم حقل البحث للعثور على منتج معين بالاسم</li>
              <li>• اسحب المنتج من أيقونة السحب (⋮⋮) لتحريكه</li>
              <li>• المنتج في الأعلى سيظهر أولاً في الموقع</li>
              <li>• اضغط &quot;حفظ الترتيب&quot; لحفظ التغييرات</li>
              <li>• يمكنك إعادة تعيين الترتيب في أي وقت</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
