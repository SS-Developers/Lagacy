import axios from "axios";
import moment from "moment";
import GlanceItem from "./GlanceItem";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../context";
import { useMediaQuery } from "react-responsive";
import { glanceInfo, unformattedPeriod } from "../models/glanceTypes";

const Glance = (props) => {
  const [glanceInfo, setGlanceInfo] = useState<glanceInfo>({});
  const [currentPeriod, setCurrentPeriod] = useState({
    name: "WKN",
    icon: "WKN",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [nextPeriod, setNextPeriod] = useState({ name: "WKN", icon: "WKN" });
  const [unformattedPeriod, setUnformattedPeriod] = useState<unformattedPeriod>(
    {}
  );
  const [refresher, setRefresher] = useState(1);
  const [refreshCount, setRefreshCount] = useState(0);
  const [tillNextPeriod, setTillNextPeriod] = useState("");
  const [elapsed, setElapsed] = useState("");
  const classInfo = useSelector(
    (state: RootState) => state.timetable.classInfo
  );
  const language = useSelector((state: RootState) => state.account.language);
  const userInfo = useSelector((state: RootState) => state.account.userInfo);
  const isPhone = useMediaQuery({ query: "(max-width: 56.25em)" });
  console.log(isPhone);

  const advanceTimetoTime = (advanceTime, now) => {
    if (isNaN(advanceTime)) return;
    return advanceTime.length === 5
      ? new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          +advanceTime.slice(0, 1),
          +advanceTime.slice(1, 3),
          +advanceTime.slice(3, 5)
        )
      : new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          +advanceTime.slice(0, 2),
          +advanceTime.slice(2, 4),
          +advanceTime.slice(4, 6)
        );
  };

  useEffect(() => {
    console.log("refreshed!");
    axios
      .get("https://apis.ssdevelopers.xyz/timetables/getGlance", {
        headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      })
      .then(({ data }) => {
        console.log(data);
        setGlanceInfo(data);
        setIsLoading(false);
      });
  }, [refresher]);

  useEffect(() => {
    if (glanceInfo.refresher?.length !== 0) setRefreshCount(refreshCount + 1);
  }, [glanceInfo.refresher]);

  // Glance timekeeper | refresher & next period calculations
  let intervalId;
  useEffect(() => {
    intervalId = setInterval(() => {
      const now = new Date();
      const advanceTime: string | number = +`${now.getHours()}${
        (now.getMinutes() < 10 ? "0" : "") + now.getMinutes()
      }${(now.getSeconds() < 10 ? "0" : "") + now.getSeconds()}`;

      // @ts-ignore
      if (glanceInfo.refresher.includes(advanceTime.toString())) {
        setRefresher(refresher + 1);
      }

      // Till next period calculations
      if (
        (glanceInfo.time?.nextClassTime &&
          glanceInfo.time?.thisClassTime &&
          now.getSeconds() === 0) ||
        refreshCount === 2
      ) {
        setRefreshCount(refreshCount + 1);
        const nextPeriodTime = advanceTimetoTime(
          glanceInfo.time?.nextClassTime,
          now
        );
        const thisPeriodTime = advanceTimetoTime(
          glanceInfo.time?.thisClassTime,
          now
        );

        // Calculate the time difference between next period and now
        const nextTill: any = {
          till: moment.duration(moment(nextPeriodTime).diff(moment(now))),
        };
        nextTill.hoursTill = parseInt(nextTill.till.asHours());
        nextTill.minutesTill = parseInt(nextTill.till.asMinutes()) % 60;
        const thisTill: any = {
          till: moment.duration(moment(thisPeriodTime).diff(moment(now))),
        };
        thisTill.hoursTill = Math.abs(parseInt(thisTill.till.asHours()));
        thisTill.minutesTill = Math.abs(
          parseInt(thisTill.till.asMinutes()) % 60
        );
        if (language === "EN") {
          if (nextTill.hoursTill === 0) {
            setTillNextPeriod(
              `in ${nextTill.minutesTill} ${
                nextTill.minutesTill <= 1 ? "minute" : "minutes"
              }.`
            );
          } else if (nextTill.hoursTill === 0 && nextTill.minutesTill === 0) {
            setTillNextPeriod(
              `in ${nextTill.hoursTill} ${
                nextTill.hoursTill <= 1 ? "hour" : "hours"
              }.`
            );
          } else {
            setTillNextPeriod(
              `in ${nextTill.hoursTill} ${
                nextTill.hoursTill === 1 ? "hour" : "hours"
              } and ${nextTill.minutesTill} ${
                nextTill.minutesTill <= 1 ? "minute" : "minutes"
              }`
            );
          }
          if (thisTill.hoursTill === 0) {
            setElapsed(
              `${thisTill.minutesTill} ${
                thisTill.minutesTill <= 1 ? "minute" : "minutes"
              } elapsed.`
            );
          } else if (thisTill.hoursTill === 0 && thisTill.minutesTill === 0) {
            setElapsed(
              `in ${thisTill.hoursTill} ${
                thisTill.hoursTill <= 1 ? "hour" : "hours"
              }.`
            );
          } else {
            setElapsed(
              `${thisTill.hoursTill} ${
                thisTill.hoursTill === 1 ? "hour" : "hours"
              } and ${thisTill.minutesTill} ${
                thisTill.minutesTill <= 1 ? "minute" : "minutes"
              } elapsed.`
            );
          }
        } else {
          setTillNextPeriod(
            nextTill.hoursTill === 0
              ? `ในอีก ${nextTill.minutesTill} นาที`
              : `ในอีก ${nextTill.hoursTill} ชั่วโมงและ ${nextTill.minutesTill} นาที`
          );
          setElapsed(
            thisTill.hoursTill === 0
              ? `เรียนไปแล้ว ${thisTill.minutesTill} นาที`
              : `เรียนไปแล้ว ${thisTill.hoursTill} ชั่วโมงและ ${thisTill.minutesTill} นาที`
          );
        }
      }
      // @ts-ignore
    }, [1000]);
    // window.scrollTo(0, 0);

    // cleanup function
    return () => clearInterval(intervalId);
  }, [refreshCount]);

  useEffect(() => {
    if (Object.keys(glanceInfo).length !== 0 && classInfo.primaryClass) {
      setUnformattedPeriod({
        currentPeriod: glanceInfo.curClass,
        nextPeriod: glanceInfo.nextClass,
      });
      console.log({
        currentPeriod: glanceInfo.curClass,
        nextPeriod: glanceInfo.nextClass,
      });
      setCurrentPeriod({
        // @ts-ignore
        name: glanceInfo?.format["classCode"][language][glanceInfo.curClass]
          .name,
        // @ts-ignore
        icon: glanceInfo?.format["classCode"][language][glanceInfo.curClass]
          .icon,
      });
      setNextPeriod({
        // @ts-ignore
        name: glanceInfo?.format["classCode"][language][glanceInfo.nextClass]
          .name,
        // @ts-ignore
        icon: glanceInfo?.format["classCode"][language][glanceInfo.nextClass]
          .icon,
      });
      // console.log(currentPeriod, nextPeriod);
    }
  }, [glanceInfo]);

  if (isLoading) {
    return (
      <>
        <h3 className="bar__header">At a glance</h3>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        ></motion.section>
      </>
    );
  }
  if (unformattedPeriod.currentPeriod === "WKN" && classInfo.primaryClass) {
    return (
      <>
        <h3 className="bar__header">At a glance</h3>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        >
          <GlanceItem
            color={"#3fd9a5"}
            header={
              <h3>
                {language === "EN"
                  ? "It's the weekends!"
                  : "วันหยุดสัปดาห์แล้ว!"}
              </h3>
            }
            subheader={
              language === "EN"
                ? "Breaks are essential for your brain."
                : "พักผ่อนเยอะๆ นะ"
            }
            link={false}
            icon={`https://apis.ssdevelopers.xyz/icons/openBook.png`}
            size={"small"}
          />

          <GlanceItem
            color={"#eb345b"}
            header={
              <h3>
                {language === "EN" ? "Wonder which" : "ได้เวลาเตรียมตัว"}
                <br />
                {language === "EN"
                  ? "lessons are coming up?"
                  : "สำหรับสัปดาห์หน้าแล้ว"}
              </h3>
            }
            subheader={
              language === "EN"
                ? "Timetables to the rescue!"
                : "ตารางสอนอาจจะช่วยได้นะ"
            }
            link={{
              id: classInfo.primaryClass._id,
              color: userInfo?.color?.replace("#", ""),
              text: language === "EN" ? "View in timetable" : "ดูในตารางสอน",
            }}
            icon={`https://apis.ssdevelopers.xyz/icons/neural.png`}
            size={"large"}
            secondItem
          />
        </motion.section>
      </>
    );
  } else if (
    unformattedPeriod.currentPeriod === "FTD" &&
    unformattedPeriod.nextPeriod === "FTD" &&
    classInfo.primaryClass
  ) {
    return (
      <>
        <h3 className="bar__header">At a glance</h3>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        >
          {unformattedPeriod.currentPeriod === "FTD" &&
          unformattedPeriod.nextPeriod === "FTD" ? (
            <>
              <GlanceItem
                color={"#fa9e1e"}
                header={
                  <h3>
                    {language === "EN"
                      ? "You finished the day"
                      : "เรียนจบวันแล้ว"}
                  </h3>
                }
                subheader={language === "EN" ? "Well done!" : "ยินดีด้วย!"}
                link={{
                  id: classInfo.primaryClass._id,
                  color: userInfo?.color?.replace("#", ""),
                  text:
                    language === "EN" ? "View in timetable" : "ดูในตารางสอน",
                }}
                icon={`https://apis.ssdevelopers.xyz/icons/desk.png`}
                size={"small"}
              />

              <GlanceItem
                color={"#755cf7"}
                prep={glanceInfo.prep}
                prepType={glanceInfo.prepType}
                header={
                  <h3>
                    {language === "EN"
                      ? "Books to bring tomorrow"
                      : "พรุ่งนี้ต้องเอาหนังสืออะไรไปบ้างนะ?"}
                  </h3>
                }
                // icon={`https://apis.ssdevelopers.xyz/icons/briefcase.png`}
                size={"large"}
                secondItem
              />
            </>
          ) : (
            <>
              <GlanceItem
                color={
                  "linear-gradient(45deg, rgba(105,172,234,1) 0%, rgba(110,223,100,1) 71%)"
                }
                header={
                  <h3>
                    {language === "EN"
                      ? "Current Double Period:"
                      : "ขณะนี้คาบคู่:"}
                    <br />
                    {currentPeriod.name}
                  </h3>
                }
                subheader={false}
                link={{
                  id: classInfo.primaryClass._id,
                  color: userInfo?.color?.replace("#", ""),
                  text:
                    language === "EN" ? "View in timetable" : "ดูในตารางสอน",
                }}
                icon={`https://apis.ssdevelopers.xyz/icons/${currentPeriod.icon}`}
                size={"full"}
              />
            </>
          )}
        </motion.section>
      </>
    );
  } else if (
    (unformattedPeriod.currentPeriod === "PHD" ||
      unformattedPeriod.currentPeriod === "SSH") &&
    (unformattedPeriod.nextPeriod === "PHD" ||
      unformattedPeriod.currentPeriod === "SSH") &&
    classInfo.primaryClass
  ) {
    return (
      <>
        <h1 className="bar__header">At a glance</h1>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        >
          <GlanceItem
            color={"#3fd9a5"}
            header={
              <>
                {language === "EN"
                  ? `It's ${glanceInfo.name?.EN}`
                  : `วันนี้${glanceInfo.name?.TH}`}
              </>
            }
            subheader={
              language === "EN" ? glanceInfo.desc?.EN : glanceInfo.desc?.TH
            }
            link={false}
            icon={`https://apis.ssdevelopers.xyz/icons/${currentPeriod.icon}`}
            size={"small"}
          />
          <GlanceItem
            color={"#eb345b"}
            header={
              <>
                {language === "EN" ? "Wonder which" : "ได้เวลาเตรียมตัว"}
                <br />
                {language === "EN"
                  ? "lessons are coming up?"
                  : "สำหรับสัปดาห์หน้าแล้ว"}
              </>
            }
            subheader={
              language === "EN"
                ? "Timetables to the rescue!"
                : "ตารางสอนอาจจะช่วยได้นะ"
            }
            link={{
              id: classInfo.primaryClass._id,
              color: userInfo?.color?.replace("#", ""),
              text: language === "EN" ? "View in timetable" : "ดูในตารางสอน",
            }}
            icon={`https://apis.ssdevelopers.xyz/icons/neural.png`}
            size={"large"}
            secondItem
          />
        </motion.section>
      </>
    );
  } else if (classInfo.primaryClass) {
    return (
      <>
        <h3 className="bar__header">At a glance</h3>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        >
          <>
            <GlanceItem
              color={"#69ACEA"}
              header={
                <h3 style={{ borderBottom: "1px solid #69ACEA" }}>
                  {language === "EN" ? "Current Period:" : "ตอนนี้วิชา:"}
                  <br />
                  {currentPeriod.name}
                </h3>
              }
              subheader={elapsed}
              link={{
                id: classInfo.primaryClass._id,
                color: userInfo?.color?.replace("#", ""),
                text: language === "EN" ? "View in timetable" : "ดูในตารางสอน",
              }}
              icon={`https://apis.ssdevelopers.xyz/icons/${currentPeriod.icon}`}
              size={"small"}
            />

            <GlanceItem
              color={"#70F094"}
              header={
                <h3>
                  {language === "EN" ? "Next Period:" : "วิชาต่อไป:"}
                  <br />
                  {nextPeriod.name}
                </h3>
              }
              secondItem
              subheader={tillNextPeriod}
              link={{
                id: classInfo.primaryClass._id,
                color: userInfo?.color?.replace("#", ""),
                text: language === "EN" ? "View in timetable" : "ดูในตารางสอน",
              }}
              icon={`https://apis.ssdevelopers.xyz/icons/${nextPeriod.icon}`}
              size={"large"}
            />
          </>
        </motion.section>
      </>
    );
  }

  if (!classInfo.primaryClass)
    return (
      <>
        <h3 className="bar__header">At a glance</h3>
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          className="bar"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="bar__item welcome"
            style={{
              animation: "bgColor 5s infinite linear",
              width: "100%",
            }}
          >
            <h3>Welcome to Timetables!</h3>
            <p>Add yo primary class to get started.</p>
            <Link to="/preferences">
              <button className="btn bar__item--btn">Add primary class</button>
            </Link>
            <img
              src={`https://apis.ssdevelopers.xyz/icons/welcome.png`}
              className="bar__icon"
              alt="Science Icon"
              height="150"
            />
          </motion.div>
        </motion.section>
      </>
    );

  return <></>;
};

export default Glance;
