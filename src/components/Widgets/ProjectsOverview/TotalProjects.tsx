"use client";

import React from "react";

const TotalProjects: React.FC = () => {
  return (
    <>
      <div className="bg-primary-50 dark:bg-[#15203c] rounded-md py-[22px] px-[20px]">
        <div className="flex items-center">
          <div className="text-primary-500 leading-none ltr:mr-[10px] rtl:ml-[10px]">
            <i className="material-symbols-outlined !text-5xl">folder_open</i>
          </div>
          <div>
            <span className="block">المقالات المهمة</span>
            <h5 className="!mb-0 !text-[20px] !mt-[2px]">1235</h5>
          </div>
        </div>
      </div>
    </>
  );
};

export default TotalProjects;
