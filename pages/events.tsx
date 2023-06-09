import EventCard from "@/components/EventCard";
import { Database } from "@/types/supabase";
import { getEvents } from "@/utils/getEvents";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";

import localData from "../public/data.json";

export default function Events({
  events,
}: {
  events: Database["public"]["Tables"]["events"]["Row"][];
}): JSX.Element {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Head>
        <title>{localData["title"] + " Events"}</title>
        <meta name="description" content="Regalia Events" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className="h-full w-full
        bg-gradient-to-tl from-fuchsia-950 to-black z-10 relative pt-16"
      >
        <div className="flex flex-col justify-start items-left ">
          <h1 className="text-5xl text-left font-normal text-white px-10 pt-10">
            Events.
          </h1>
          <span className="text-2xl text-left font-thin text-white px-10 ">
            Participate and emerge victorious in these eyegrabbing events.
          </span>
        </div>
        <div className="flex flex-row flex-wrap justify-center items-center">
          {events.map((event: any) => (
            <EventCard key={event.id} eventData={event} />
          ))}
        </div>
        <Image
          src="https://i.imgur.com/G42sxIN.png"
          alt="Background"
          width={700}
          height={700}
          className="fixed md:top-36 md:right-28 opacity-25 top-24 -right-16"
          style={{
            zIndex: 0,
          }}
        />
      </main>
    </>
  );
}

export async function getServerSideProps() {
  let data;

  try {
    data = await getEvents("*");
  } catch (err) {
    console.log(err);
  }

  return {
    props: {
      events: data,
    },
  };
}
