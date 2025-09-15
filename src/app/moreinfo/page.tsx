// import type { Metadata } from "next";
// import { Lexend, Montserrat } from "next/font/google";

export default function MoreInfo() {
  return (
    <div className="m-0 text-left w-full bg-transparent break-words">
      <div className="main-caption h-screen w-full">
        <h2 className="pt-[45vh] text-center text-[#d8933f] text-xl font-montserrat font-normal m-0">
          Hi, I'm Abdullah Aamir. I'm into anything that interests me.
        </h2>
      </div>

      <div className="sub-caption flex gap-[3vh] p-[3.5%] flex-col sm:flex-row bg-white">
        <div className="quotes">
          <h2 className="p-[3%] text-[29px] font-lexend font-normal leading-[47px] m-0 text-[#1c4587] pb-0">
            "Look deep into nature, and then you will understand everything
            better."
          </h2>
          <h3 className="p-[3%] text-[15px] font-lexend font-light leading-[30px] m-0 text-[#1c4587] pt-0">
            -Albert Fuckstein
          </h3>
        </div>
        <div className="aim">
          <h2 className="p-[3%] text-[29px] font-lexend font-normal leading-[47px] m-0 text-[#1c4587] text-[67px] font-medium leading-[24px] mt-[17px] mb-[17px]">
            I aim
          </h2>
          <h3 className="p-[3%] text-[15px] font-lexend font-light leading-[30px] m-0 text-[#1c4587] pt-0">
            to blur the lines between humans and tech. I believe with good skills
            and practice; we can make great use of technology and fill the voids
            in our daily life. My goal is to find those voids and fulfill them
            where and when needed.
          </h3>
        </div>
      </div>

      <div className="about">
        <div className="paragraph">
          <h2 className="p-[3%] text-[29px] font-lexend font-normal leading-[47px] m-0 text-[#1c4587] text-[#d8933f] pb-0 text-[30px]">About me.</h2>
          <h3 className="p-[3%] text-[15px] font-lexend font-light leading-[30px] m-0 text-[#1c4587] text-[#d8933f] pt-0">
            Currently completing my Bachelor's Degree in Defence Forensics and Cybersecurity, I aim to gather the most experience along the way of my learning path with noticeable grades so I can obtain my spot in the companies that are well known around the world. <br />

  As of this generation, the worth and value of a person is dependent on the skillsets they possess and how keen they are at executing it. I believe in learning and adapting to new technologies and trends as they come. I have a passion for technology and how it works, and I want to be a part of the change that is happening around us.
          </h3>
        </div>
      </div>
    </div>
  );
}
