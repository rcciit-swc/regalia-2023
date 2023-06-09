import LoadingSpinner from "@/components/LoadingSpinner/LoadingSpinner";
import PaymentModal from "@/components/Modals/PaymentModal";
import { Database } from "@/types/supabase";
import { cancelRegistration } from "@/utils/cancelRegistration";
import { getRegisteredEvents } from "@/utils/getRegisteredEvents";
import { searchEmailInParticipation } from "@/utils/searchEmailInParticipation";
import { User } from "@supabase/supabase-js";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";

import localData from "../public/data.json";

export default function RegisteredEvents({
  user,
  isLoading,
}: {
  user: User | null;
  isLoading: boolean;
}): JSX.Element {
  // all the registered events from participation table
  const [data, setData] = useState<
    Database["public"]["Tables"]["participation"]["Row"][]
  >([]);
  // stores the checkbox values for the registered events
  const [checked, setChecked] = useState<boolean[]>([]);

  const [showPaymentModal, setshowPaymentModal] = useState<boolean>(false);

  const [amount, setAmount] = useState<number>(0);

  // stores all the participation ids of the events to be paid
  const [toBePaid, setToBePaid] = useState<string[]>([]);

  // events where user himself has not registered but is present in a team
  const [isTeamRegisteredEventsExpanded, setIsteamRegisteredEventsExpanded] =
    useState(false);
  const [isTeamRegisteredEventsLoading, setIsteamRegisteredEventsLoading] =
    useState(false);
  const [teamRegisteredEvents, setTeamRegisteredEvents] = useState<
    Database["public"]["Tables"]["participation"]["Row"][] | undefined
  >(undefined);

  async function getTeamRegisteredEvents() {
    setIsteamRegisteredEventsExpanded(!isTeamRegisteredEventsExpanded);
    setIsteamRegisteredEventsLoading(true);

    if (user) {
      const data = await searchEmailInParticipation(user.email ?? "");

      if (data.length > 0) {
        setTeamRegisteredEvents(data);
        setIsteamRegisteredEventsLoading(false);

        // TODO: not working properly
        window.scrollBy(0, 400);
      } else {
        setIsteamRegisteredEventsLoading(false);
      }
    }
  }

  function showPaymentModalHandler() {
    const participationIDs: string[] = [];

    for (let i = 0; i < checked.length; i++) {
      if (checked[i]) {
        participationIDs.push(data[i].id);
      }
    }

    setToBePaid(participationIDs);

    setshowPaymentModal(true);
  }

  useEffect(() => {
    if (!isLoading) {
      Promise.all([
        getRegisteredEvents({
          email: user?.email ?? "",
        }).then((data) => {
          if (data) {
            setData(data);

            // only the events which have not been paid yet should be checked by default
            setChecked(
              data.map((item) => {
                if (item.transaction_id !== null && item.phone_number !== null)
                  return false;
                return true;
              })
            );

            let tempAmount = 0;

            data.forEach(
              (item: Database["public"]["Tables"]["participation"]["Row"]) => {
                if (
                  !item.registration_cancelled &&
                  item.transaction_id === null
                ) {
                  tempAmount += item.events!.fees!;
                }
              }
            );
            setAmount(tempAmount);
          }
        }),
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  function handleCheckEvent(index: number) {
    // temp variable for manipulating checked array
    const newChecked = checked;

    newChecked[index] = !newChecked[index];
    setChecked([...newChecked]);

    // calculates new amount when a checkbox is checked
    const tempData = [...data];
    if (!newChecked[index]) {
      setAmount(amount - tempData[index]!.events!.fees ?? 0);
    } else {
      setAmount(amount + tempData[index]!.events!.fees ?? 0);
    }
  }

  function handleCancelRegistration(index: number, fees: number) {
    const newData = data;
    newData[index].registration_cancelled = false;
    setData([...newData]);

    if (checked[index]) {
      setAmount(amount + fees);
    }
  }

  return (
    <>
      <Head>
        <title>{`${localData["title"]} Events`}</title>
        <meta name="description" content="RCCIIT's Official Techfest" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={`bg-gradient-to-tl from-fuchsia-950 to-black pt-32 ${
          (data && data.length > 0) ||
          (teamRegisteredEvents && teamRegisteredEvents.length > 0)
            ? "h-auto"
            : "h-screen"
        }`}
      >
        <h1 className="text-5xl font-normal text-center text-white dark:text-gray-100">
          Registered Events
        </h1>
        {data.length === 0 ? (
          <span className="text-red-500 text-center text-lg p-5 w-full flex flex-row flex-wrap items-center justify-center">
            You have not registered yourself for any event yet!
          </span>
        ) : (
          <>
            <span
              className="text-center flex flex-row flex-wrap items-start justify-center text-lg mt-4 text-red-800"
              style={{
                fontFamily: "Unbounded,cursive",
              }}
            >
              Registration of only unpaid events can be cancelled!
            </span>
            <div className="flex flex-row flex-wrap items-start justify-center h-auto w-full">
              {" "}
              {data.map((registrationData, index) => {
                return (
                  <div
                    className="flex flex-col justify-evenly items-center w-72 h-[400px] m-8 bg-white rounded-3xl shadow-lg p-4 z-10"
                    key={`event__${index}`}
                  >
                    <div
                      className="w-full h-48 rounded-3xl relative "
                      style={{
                        overflow: "hidden",
                      }}
                    >
                      {registrationData.events && (
                        <Image
                          src={`${registrationData.events.poster_image}.png`}
                          alt="Event Poster"
                          fill
                          style={{ objectFit: "cover" }}
                          className="rounded-3xl "
                        />
                      )}
                    </div>
                    <h1 className="text-3xl font-thin text-center text-black dark:text-gray-100">
                      {registrationData.events && registrationData.events.name}
                    </h1>
                    {registrationData.team_name && (
                      <h1
                        className="text-lg font-normal text-center text-black dark:text-gray-100"
                        style={{
                          fontFamily: "Unbounded,cursive",
                        }}
                      >
                        <b>Team Name:</b> {registrationData.team_name}
                      </h1>
                    )}
                    {registrationData.transaction_id === null &&
                      registrationData.transaction_verified === false &&
                      registrationData.registration_cancelled === false && (
                        <button
                          className="bg-red-700 text-white rounded py-2 px-4 hover:bg-red-800 action:bg-red-800"
                          onClick={() => {
                            cancelRegistration({
                              participation_id: registrationData.id,
                            }).then(() => {
                              const newData = data;
                              newData[index].registration_cancelled = true;
                              setData([...newData]);
                              if (checked[index]) {
                                setAmount(
                                  amount - registrationData!.events!.fees
                                );
                              }
                            });
                          }}
                        >
                          Cancel Registration!
                        </button>
                      )}
                    {registrationData.registration_cancelled && (
                      <>
                        <span className="text-base text-rose-600">
                          Registration Cancelled!
                        </span>
                        <button
                          onClick={() => {
                            cancelRegistration({
                              participation_id: registrationData.id,
                              cancel: false,
                            }).then(() => {
                              handleCancelRegistration(
                                index,
                                registrationData!.events!.fees
                              );
                            });
                          }}
                          className="bg-green-700 text-black rounded py-2 px-4 hover:bg-green-800 action:bg-green-800"
                        >
                          Keep Registration
                        </button>
                      </>
                    )}
                    {/* remove checkbox if registration is already cancelled */}
                    {registrationData.transaction_id === null &&
                      registrationData.registration_cancelled === false && (
                        <span className="flex items-center text-black">
                          <input
                            defaultChecked={checked[index]}
                            id="checked-checkbox"
                            type="checkbox"
                            onClick={() => {
                              handleCheckEvent(index);
                            }}
                            value=""
                            className="w-8 h-8 text-green-700 rounded"
                          />
                          <label className="ml-2">Pay now!</label>
                        </span>
                      )}
                  </div>
                );
              })}
            </div>
          </>
        )}
        {amount !== 0 && (
          <span className="flex flex-row justify-center rounded  mb-4">
            <button
              className="text-black bg-white py-2 px-4 rounded hover:bg-[blueviolet] hover:text-white action:bg-green-800"
              style={{
                fontFamily: "Unbounded,cursive",
              }}
              onClick={() => {
                showPaymentModalHandler();
              }}
            >{`Pay Rs.${amount}!`}</button>
          </span>
        )}
        <section className="pb-10">
          <div className="flex justify-center mt-10">
            <button
              onClick={
                teamRegisteredEvents && teamRegisteredEvents.length > 0
                  ? () => {
                      if (!isTeamRegisteredEventsExpanded) {
                        setIsteamRegisteredEventsExpanded(true);
                      }
                    }
                  : async () => {
                      await getTeamRegisteredEvents();
                    }
              }
              className="text-black bg-white py-2 px-4 rounded hover:bg-[blueviolet] hover:text-white action:bg-green-800"
              style={{
                fontFamily: "Unbounded,cursive",
              }}
            >
              Team events where you are participating
            </button>
          </div>
          {isTeamRegisteredEventsLoading ? (
            <div className="flex flex-row justify-center">
              <LoadingSpinner />
            </div>
          ) : (
            <>
              {teamRegisteredEvents &&
              teamRegisteredEvents.length > 0 &&
              isTeamRegisteredEventsExpanded ? (
                <div className="flex flex-row flex-wrap items-start justify-center h-auto w-full">
                  {teamRegisteredEvents.map((registrationData, index) => {
                    return (
                      <div
                        className="flex flex-col justify-evenly items-center w-96 h-[400px] m-8 bg-white rounded-3xl shadow-lg p-4 z-10"
                        key={`team__events__${index}`}
                      >
                        <div
                          className="w-full h-48 rounded-3xl relative "
                          style={{
                            overflow: "hidden",
                          }}
                        >
                          {registrationData && (
                            <Image
                              src={`${registrationData.poster_image}.png`}
                              alt="Event Poster"
                              fill
                              style={{ objectFit: "cover" }}
                              className="rounded-3xl "
                            />
                          )}
                        </div>
                        <h1 className="text-3xl font-thin text-center text-black dark:text-gray-100">
                          {registrationData && registrationData.name}
                        </h1>
                        {registrationData.team_name && (
                          <h1
                            className="text-xl font-normal text-center text-black dark:text-gray-100"
                            style={{
                              fontFamily: "Unbounded,cursive",
                            }}
                          >
                            <b>Team Name:</b> {registrationData.team_name}
                          </h1>
                        )}
                        {registrationData.team_name && (
                          <h1
                            className="text-lg font-bold text-center text-black dark:text-gray-100"
                            style={{
                              fontFamily: "Unbounded,cursive",
                            }}
                          >
                            <b>Registered by:</b>
                            <br></br>
                            <span className="text-base font-normal text-center text-black dark:text-gray-100">
                              {registrationData.registered_by}
                            </span>
                          </h1>
                        )}
                        {registrationData.team_name && (
                          <h1
                            className="text-lg font-normal text-center text-black dark:text-gray-100"
                            style={{
                              fontFamily: "Unbounded,cursive",
                            }}
                          >
                            <b>Team Members:</b>
                          </h1>
                        )}
                        {
                          <ul
                            className="text-base font-thin text-center text-black dark:text-gray-100"
                            style={{
                              fontFamily: "Unbounded,cursive",
                            }}
                          >
                            {registrationData.team_member_0 && (
                              <li>{registrationData.team_member_0}</li>
                            )}
                            {registrationData.team_member_1 && (
                              <li>{registrationData.team_member_1}</li>
                            )}
                            {registrationData.team_member_2 && (
                              <li>{registrationData.team_member_2}</li>
                            )}
                            {registrationData.team_member_3 && (
                              <li>{registrationData.team_member_3}</li>
                            )}
                            {registrationData.team_member_4 && (
                              <li>{registrationData.team_member_4}</li>
                            )}
                            {registrationData.team_member_5 && (
                              <li>{registrationData.team_member_5}</li>
                            )}
                          </ul>
                        }
                      </div>
                    );
                  })}
                </div>
              ) : (
                <span className="text-center flex flex-row flex-wrap items-center justify-center text-lg mt-4 text-red-500">
                  {teamRegisteredEvents === undefined ||
                  teamRegisteredEvents.length !== 0
                    ? ""
                    : "No team events registered!"}
                </span>
              )}
            </>
          )}
        </section>
      </main>
      <PaymentModal
        open={showPaymentModal}
        setOpen={setshowPaymentModal}
        amount={amount}
        setAmount={setAmount}
        toBePaid={toBePaid}
        setToBePaid={setToBePaid}
        email={user?.email || ""}
        registeredEvents={data}
        setRegisteredEvents={setData}
        setChecked={setChecked}
      />
    </>
  );
}
