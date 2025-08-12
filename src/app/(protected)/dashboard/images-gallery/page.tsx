"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getGalleries } from "../../../../../services/apiGallery";
import { useQuery } from "@tanstack/react-query";

const ProductsGrid: React.FC = () => {
  const { data: gallery } = useQuery({
    queryKey: ["galleries"],
    queryFn: getGalleries,
  });

  return (
    <>
      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px] mb-[25px]">
        {gallery?.map((image) => (
          <div key={image.id} className="md:mb-[10px] lg:mb-[17px]">
            <div className="relative">
              <span className="block ltr:right-0 rtl:left-0 bottom-0 w-[65px] h-[65px] absolute ltr:rounded-tl-md rtl:rounded-tr-md bg-white dark:bg-[#0c1427]"></span>

              <Link
                href={`/dashboard/images-gallery/${image.id}`}
                className="block rounded-md"
              >
                <div className="relative w-full aspect-[1/1] overflow-hidden rounded-md">
                  <Image
                    src={image.image_urls[0]}
                    alt={image.title_ar}
                    fill
                    className="object-cover"
                  />
                </div>
              </Link>

              <button
                className="rounded-md transition-all z-[1] inline-block absolute ltr:right-0 rtl:left-0 bottom-0 w-[60px] h-[60px] bg-primary-500 text-white hover:bg-primary-400 flex items-center justify-center overflow-hidden"
                type="button"
              >
                <Image
                  src={image.image_urls[1]}
                  alt={image.title_ar}
                  width={60}
                  height={60}
                  className="object-cover"
                />
              </button>
            </div>

            <div className="mt-[19px]">
              <h6 className="!text-md !font-normal">
                <Link
                  href={`/dashboard/images-gallery/${image.id}`}
                  className="transition-all hover:text-primary-500"
                >
                  {image.title_ar}
                </Link>
              </h6>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {/* <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md">
        <div className="trezo-card-content">
          <div className="sm:flex sm:items-center justify-between">
            <p className="!mb-0">
              {" "}
              Showing{" "}
              {Math.min(
                (currentPage - 1) * productsPerPage + 1,
                filteredProducts.length
              )}
              -
              {Math.min(currentPage * productsPerPage, filteredProducts.length)}{" "}
              of {filteredProducts.length} results
            </p>

            <ol className="mt-[10px] sm:mt-0">
              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_right
                  </i>
                </button>
              </li>

              {[...Array(totalPages)].map((_, index) => (
                <li
                  key={index}
                  className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0"
                >
                  <button
                    onClick={() => handlePageChange(index + 1)}
                    className={`w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border ${
                      currentPage === index + 1
                        ? "bg-primary-500 text-white"
                        : "border-gray-100 dark:border-[#172036] hover:bg-primary-500 hover:text-white hover:border-primary-500"
                    }`}
                  >
                    {index + 1}
                  </button>
                </li>
              ))}

              <li className="inline-block mx-[2px] ltr:first:ml-0 ltr:last:mr-0 rtl:first:mr-0 rtl:last:ml-0">
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="w-[31px] h-[31px] block leading-[29px] relative text-center rounded-md border border-gray-100 dark:border-[#172036] transition-all hover:bg-primary-500 hover:text-white hover:border-primary-500"
                >
                  <span className="opacity-0">0</span>
                  <i className="material-symbols-outlined left-0 right-0 absolute top-1/2 -translate-y-1/2">
                    chevron_left
                  </i>
                </button>
              </li>
            </ol>
          </div>
        </div>
      </div> */}
    </>
  );
};

export default ProductsGrid;
