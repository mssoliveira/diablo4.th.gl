"use client";
import { useDict } from "@/app/components/(i18n)/i18n-provider";
import Modal from "@/app/components/modal";
import { API_BASE_URI } from "@/app/lib/env";
import { useAccountStore, useSettingsStore } from "@/app/lib/storage";
import type { OwAd } from "@overwolf/types/owads";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import Moveable from "react-moveable";

declare global {
  interface Window {
    OwAd?: typeof OwAd;
  }
}

function Ads() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adRef = useRef<HTMLDivElement | null>(null);
  const isPatron = useAccountStore((state) => state.isPatron);
  const settingsStore = useSettingsStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const dict = useDict();
  const moveableRef = useRef<Moveable>(null);

  useEffect(() => {
    if (isPatron) {
      return;
    }
    moveableRef.current?.moveable.request(
      "draggable",
      { deltaX: 0, deltaY: 0 },
      true
    );

    const onResize = () => {
      // @ts-ignore
      moveableRef.current?.moveable.request(
        "draggable",
        { deltaX: 0, deltaY: 0 },
        true
      );
    };
    window.addEventListener("resize", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize, true);
    };
  }, []);

  if (isPatron) {
    return <></>;
  }

  function onOwAdReady() {
    if (typeof window.OwAd === "undefined" || adRef.current === null) {
      return;
    }

    new window.OwAd(adRef.current, {
      size: { width: 400, height: 300 },
    });
  }
  return (
    <>
      <Script
        src="https://content.overwolf.com/libs/ads/latest/owads.min.js"
        async
        onLoad={onOwAdReady}
      />
      <div
        ref={containerRef}
        className="fixed right-0 bottom-0 z-[9999]"
        style={{
          transform: settingsStore.adTransform,
        }}
      >
        {!settingsStore.lockedWindow && (
          <div className="flex w-fit rounded-t-lg bg-opacity-50 bg-neutral-800 ml-auto text-neutral-300">
            <div className="cursor-move flex items-center p-1">
              <svg className="w-[16px] h-[16px]">
                <use xlinkHref="#icon-move" />
              </svg>
            </div>
            <button
              className="flex items-center p-1"
              onClick={() =>
                setIsModalVisible((isModalVisible) => !isModalVisible)
              }
            >
              <svg className="w-[16px] h-[16px]">
                <use xlinkHref="#icon-close" />
              </svg>
            </button>
          </div>
        )}
        <div
          ref={adRef}
          className={`w-[400px] h-[300px] bg-opacity-50 bg-neutral-800`}
        />
        <div className="flex flex-col items-center justify-center absolute -z-10 inset-[100px] text-center text-white mt-6">
          {dict.menu.patronInfo}
        </div>
      </div>
      <Moveable
        ref={moveableRef}
        target={containerRef}
        draggable
        bounds={{ left: 0, top: 30, right: 0, bottom: 0, position: "css" }}
        origin={false}
        hideDefaultLines
        snappable
        onDrag={(e) => {
          e.target.style.transform = e.transform;
        }}
        onDragEnd={(e) => {
          settingsStore.setAdTransform(e.target.style.transform);
        }}
      />
      {isModalVisible && (
        <Modal onClose={() => setIsModalVisible(false)}>
          <p className="italic text-md text-center">{dict.menu.patronInfo}</p>
          <a
            href="https://www.patreon.com/join/devleon/checkout?rid=9878731"
            target="_blank"
            className="mt-1 p-2 uppercase text-center bg-white text-[#ff424d] hover:bg-gray-100"
          >
            {dict.menu.becomePatron}
          </a>
          <button
            onClick={() => {
              overwolf.utils.openUrlInDefaultBrowser(`${API_BASE_URI}/patreon`);
            }}
            className="my-1 p-2 uppercase text-white bg-[#ff424d] hover:bg-[#ca0f25]"
          >
            {dict.menu.linkPatreon}
          </button>
        </Modal>
      )}
    </>
  );
}

export default Ads;
