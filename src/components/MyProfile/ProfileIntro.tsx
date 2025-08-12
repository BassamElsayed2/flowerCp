"use client";

import Image from "next/image";
import { ProfileTypes } from "./profileType";

interface ProfileIntroProps {
  profile?: ProfileTypes;
}

const ProfileIntro: React.FC<ProfileIntroProps> = ({ profile }) => {
  return (
    <>
      <div className="trezo-card bg-white dark:bg-[#0c1427] mb-[25px] p-[20px] md:p-[25px] rounded-md text-center">
        <div className="trezo-card-header mb-[20px] md:mb-[25px] flex items-center justify-between">
          <div className="trezo-card-title">
            <h5 className="!mb-0"> الملف الشخصي</h5>
          </div>
        </div>

        <div className="trezo-card-content">
          <div className="flex items-center justify-center">
            <Image
              src={profile?.image_url || "/"}
              alt="user-image"
              className="rounded-full w-[75px]"
              width={75}
              height={75}
            />
            <div className="ltr:ml-[15px] rtl:mr-[15px]">
              <span className="block text-black dark:text-white text-[17px] font-semibold">
                {profile?.full_name?.split(" ")[0]}
              </span>
              <span className="block mt-px">{profile?.job_title}</span>
            </div>
          </div>

          {profile?.about && (
            <>
              <span className="text-black dark:text-white font-semibold block mb-[5px] mt-[16px]">
                عني
              </span>

              <p>{profile?.about}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProfileIntro;
