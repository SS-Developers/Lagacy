import TimetableItem from "../components/TimetableItem";
import Header from "../components/Header";
import AddTimetableItem from "../components/AddTimetableItem";
import SelectSearch from "react-select-search";
import ColoredButton from "../components/ColoredButton";

import { motion } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { useMediaQuery } from "react-responsive";
import { useEffect, useState } from "react";
import { accountActions } from "../context/accountSlice";
import { refetchActions } from "../context/refetchSlice";
import { modalActions } from "../context/modalSlice";
import { RootState } from "../context";

const Preferences = (props) => {
  const userInfo = useSelector((state: RootState) => state.account.userInfo);
  const language = useSelector((state: RootState) => state.account.language);
  const classInfo = useSelector(
    (state: RootState) => state.timetable.classInfo
  );
  const dispatch = useDispatch();
  const [savedConfig, setSavedConfig] = useState(1);
  const [timesEffected, setTimesEffected] = useState(0);
  const [selectedCovid, setSelectedCovid] = useState(
    userInfo.config?.showCovid
  );
  const [selectedLanguage, setSelectedLanguage] = useState(
    userInfo.config?.language
  );
  const [selectedDateFormat, setSelectedDateFormat] = useState(
    userInfo.config?.dateTime
  );
  const [selectedPrepBehavior, setSelectedPrepBehavior] = useState(
    userInfo.config?.tmrPref
  );
  const [consoleLog, setConsoleLog] = useState("on");
  const isPhone = useMediaQuery({ query: "(max-width: 56.25em)" });
  const [curTheme, setCurTheme] = useState(
    localStorage.getItem("theme") ?? "system"
  );

  useEffect(() => {
    document.title = "Preferences | SS Timetables";
  }, []);

  // useEffect(() => {
  //   if (consoleLog === "off") {
  //     // @ts-ignore
  //     if (!window.console) window.console = {};
  //     var methods = ["log", "debug", "warn", "info"];
  //     for (var i = 0; i < methods.length; i++) {
  //       console[methods[i]] = function () {};
  //     }
  //   }
  // }, [consoleLog]);

  useEffect(() => {
    fetch("https://apis.ssdevelopers.xyz/auth/editConfig", {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token"),
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        language: selectedLanguage,
        showCovid: selectedCovid,
        dateTime: selectedDateFormat,
        tmrPref: selectedPrepBehavior,
      }),
    }).then((data) => {
      if (timesEffected !== 0) {
        dispatch(accountActions.setLanguage(selectedLanguage));
        dispatch(
          modalActions.openModal({
            header:
              selectedLanguage === "EN"
                ? "Saved Settings"
                : "บันทึกการตั้งค่าใหม่เรียบร้อย",
            text:
              selectedLanguage === "EN"
                ? "Successfuly changed the settings."
                : "การตั้งค่าของคุณได้ถูกบันทึก",
          })
        );
      }
    });
    setTimesEffected(timesEffected + 1);
    dispatch(refetchActions.refetch(""));
  }, [savedConfig]);

  return (
    <>
      <Header
        text={
          <h1>
            {language === "EN" ? "Timetable" : "การตั้งค่า"}
            <br />
            {language === "EN" ? "Preferences" : "Timetables"}
          </h1>
        }
        clickProfile={"home"}
      />
      <main>
        {classInfo.primaryClass && (
          <>
            <h1 className="bar__header">SS Account</h1>
            <div className="bar ssAcc__bar">
              <div className="ssAcc__item">
                <h3>Account Dashboard</h3>
                <p>
                  {language === "EN"
                    ? "Change your name, profile picture are more"
                    : "เปลี่ยนชื่อ, ภาพโปรไฟลและอีกมากมาย"}
                </p>
                <a
                  href={`http://authentication.ssdevelopers.xyz/redirect/?service=timetables&token=${localStorage.getItem(
                    "token"
                  )}`}
                >
                  {language === "EN" ? "To Dashboard" : "ไป Dashboard"}
                </a>
              </div>
              <div className="ssAcc__item themeSwitcher">
                <h3>
                  {language === "EN" ? "Theme Switcher" : "เปลี่ยนธีมของคุณ"}
                </h3>
                <p>
                  {language === "EN"
                    ? "Dark theme, light theme and system theme"
                    : "ธีมมืด ธีมสว่าง และธีมระบบ"}
                </p>
                <div className={`themeSwitcher__buttons`}>
                  <button
                    title="Switch to light theme"
                    className={
                      curTheme === "light" ? "themeSwitcher__active" : ""
                    }
                    onClick={() => {
                      document.documentElement.setAttribute(
                        "data-theme",
                        "light"
                      );
                      setCurTheme("light");
                      localStorage.setItem("theme", "light");
                    }}
                  >
                    <i className="bx bx-sun"></i>
                  </button>
                  <button
                    title="Switch to dark theme"
                    className={
                      curTheme === "dark" ? "themeSwitcher__active" : ""
                    }
                    onClick={() => {
                      document.documentElement.setAttribute(
                        "data-theme",
                        "dark"
                      );
                      localStorage.setItem("theme", "dark");
                      setCurTheme("dark");
                    }}
                  >
                    <i className="bx bx-moon"></i>
                  </button>
                  <button
                    title="Switch to system theme"
                    className={
                      curTheme === "system" ? "themeSwitcher__active" : ""
                    }
                    onClick={() => {
                      document.documentElement.setAttribute(
                        "data-theme",
                        "system"
                      );
                      localStorage.setItem("theme", "system");
                      setCurTheme("system");
                    }}
                  >
                    <i className="bx bx-desktop"></i>
                  </button>
                </div>
              </div>
              <button
                className="config__logout"
                onClick={() => {
                  dispatch(accountActions.logout());
                }}
              >
                <p> {language === "EN" ? "Logout" : "ออกจากระบบ"}</p>
              </button>
            </div>
            <h1 className="bar__header">
              {language === "EN" ? "Configurations" : "ตั้งค่า"}
            </h1>
            <div
              className="bar config__realBar"
              style={{ overflow: "visible" }}
            >
              <div className="config__bar">
                <div
                  className="config__item"
                  style={isPhone ? {} : { paddingLeft: "1rem" }}
                >
                  <h3>{language === "EN" ? "Language" : "ภาษา / Language"}</h3>
                  <SelectSearch
                    options={[
                      { value: "EN", name: "English" },
                      { value: "TH", name: "ไทย" },
                    ]}
                    // @ts-ignore
                    onChange={setSelectedLanguage}
                    value={selectedLanguage}
                  />
                </div>
                <div className="config__item">
                  <h3>{language === "EN" ? "Time Format" : "รูปแบบเวลา"}</h3>
                  <SelectSearch
                    options={[
                      { value: "24h", name: "24 hours" },
                      { value: "12h", name: "12 hours" },
                    ]}
                    // @ts-ignore
                    onChange={setSelectedDateFormat}
                    value={selectedDateFormat}
                  />
                </div>
                <div className="config__item">
                  <h3>
                    {language === "EN"
                      ? "Covid Reports"
                      : "แสดงค่าการติดเชื้อโควิด-19"}
                  </h3>
                  <SelectSearch
                    options={[
                      { value: "covShow", name: "Show" },
                      { value: "covHide", name: "Hidden" },
                    ]}
                    // @ts-ignore
                    onChange={setSelectedCovid}
                    value={selectedCovid}
                  />
                </div>

                <div className="config__item">
                  <h3>
                    {language === "EN"
                      ? "Preperation Options"
                      : "พฤติกรรมฟีเจอร์การเตรียมตัว"}
                  </h3>
                  <SelectSearch
                    options={[
                      { value: "book", name: "Books to bring" },
                      { value: "hide", name: "Hidden" },
                    ]}
                    //@ts-ignore
                    onChange={setSelectedPrepBehavior}
                    value={selectedPrepBehavior}
                  />
                </div>
                {/* <div
                  className="config__developerOption"
                  style={{ backgroundColor: userInfo.color }}
                >
                  <h2>Developer Options</h2>
                  <div className="config__item">
                    <h3>console.log</h3>
                    <SelectSearch
                      options={[
                        { value: "on", name: "on" },
                        { value: "off", name: "off" },
                      ]}
                      // @ts-ignore
                      onChange={setConsoleLog}
                      value={consoleLog}
                    />
                  </div>
                </div> */}
                <div className="config__buttonWrapper">
                  <ColoredButton
                    text={language === "EN" ? "Save" : "บันทึก"}
                    className={"config__button"}
                    onClick={() => setSavedConfig(savedConfig + 1)}
                  />
                </div>
              </div>
            </div>
          </>
        )}
        <h1 className="bar__header">
          {language === "EN" ? "Add / Set Timetables" : "เพิ่มตารางสอน"}
        </h1>
        <div className="row">
          {classInfo.primaryClass && (
            <AddTimetableItem
              header={language === "EN" ? "Add Class" : "ห้อง"}
              button={language === "EN" ? "Add" : "เพิ่ม"}
              header2={language === "EN" ? "School" : "โรงเรียน"}
              placeholder2={
                language === "EN" ? "Search for schools" : "ค้นหาโรงเรียน"
              }
              placeholder={
                language === "EN" ? "Search for timetables" : "ค้นหาห้อง"
              }
              isPrimary={false}
            />
          )}
          {classInfo.primaryClass ? (
            <AddTimetableItem
              header={language === "EN" ? "Change Class" : "เปลี่ยนห้องของฉัน"}
              button={language === "EN" ? "Change" : "เปลี่ยน"}
              placeholder={
                language === "EN" ? "Search for timetables" : "ค้นหาห้อง"
              }
              header2={language === "EN" ? "School" : "โรงเรียน"}
              placeholder2={
                language === "EN" ? "Search for schools" : "ค้นหาโรงเรียน"
              }
              defaultOption={classInfo.primaryClass._id}
              isPrimary={true}
            />
          ) : (
            <AddTimetableItem
              header={language === "EN" ? "Set My Class" : "ห้องของฉันคือ"}
              button={language === "EN" ? "Set" : "ตั้งห้องนี้เป็นห้องของฉัน"}
              placeholder={
                language === "EN" ? "Search for timetables" : "ค้นหาห้อง"
              }
              isPrimary={true}
              isNewUser={true}
              style={{ marginBottom: "2rem" }}
            />
          )}
        </div>

        {classInfo.primaryClass && (
          <>
            <h1 className="bar__header">
              {language === "EN" ? "Remove Timetables" : "เอาตารางสอนออก"}
            </h1>
            <div className="box">
              <motion.section
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.2 }}
                className="bar timetable"
              >
                {classInfo.primaryClass && (
                  <TimetableItem
                    color={classInfo.primaryClass.color}
                    text={language === "EN" ? "My Class" : "ห้องของฉัน"}
                    disabled={true}
                    subText={classInfo.primaryClass.className}
                  />
                )}
                {classInfo.starredClass &&
                  classInfo.starredClass.map((element, index) => {
                    let schoolName;
                    switch (element.school) {
                      case "ASSUMPTION":
                        language === "EN"
                          ? (schoolName = "Assumption")
                          : (schoolName = "อัสสัมชัญ");
                        break;
                      case "NEWTON":
                        language === "EN"
                          ? (schoolName = "Newton")
                          : (schoolName = "นิวตัน");
                        break;
                      case "ESSENCE":
                        language === "EN"
                          ? (schoolName = "Essence")
                          : (schoolName = "เอสเซนส์");
                        break;
                      case "ASSUMPTION_THON":
                        language === "EN"
                          ? (schoolName = "Assumption College Thonburi")
                          : (schoolName = "อัสสัมชัญธนบุรี");
                        break;
                      default:
                        language === "EN"
                          ? (schoolName = "")
                          : (schoolName = "");
                        break;
                    }
                    return (
                      <TimetableItem
                        key={index}
                        color={element.color}
                        text={element.className}
                        subText={schoolName}
                        remove={true}
                        id={element._id}
                      />
                    );
                  })}
              </motion.section>
            </div>
          </>
        )}
      </main>
    </>
  );
};

export default Preferences;
