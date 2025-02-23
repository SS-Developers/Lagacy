import ColoredButton from "./ColoredButton";
import SelectSearch from "react-select-search";

import { motion } from "framer-motion";
import { fuzzySearch } from "react-select-search";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { refetchActions } from "../context/refetchSlice";
import { useNavigate } from "react-router";
import { modalActions } from "../context/modalSlice";

const SetupTimetableItem = (props) => {
  const [selectedOption, setSelectedOption] = useState(props.defaultOption);
  const [selectedSchool, setSelectedSchool] = useState("ASSUMPTION");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const submitHandler = (event) => {
    event.preventDefault();

    fetch("https://apis.ssdevelopers.xyz/timetables/registerUserClass", {
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("token"),
      },
      method: "POST",
      body: JSON.stringify({
        classId: selectedOption,
        isPrimary: props.isPrimary,
      }),
    })
      .then((data) => data.json())
      .then((data) => {
        dispatch(refetchActions.refetch(""));
        if (props.isNewUser) {
          props.liftDone(true);
          // navigate("/");
        }
        if (data.modal) {
          dispatch(
            modalActions.openModal({ header: data.header, text: data.message })
          );
        }
      });
  };

  return (
    <form className="setupTimetables" onSubmit={submitHandler}>
      <motion.div
        animate={{ opacity: 1 }}
        initial={{ opacity: 0 }}
        className="setupTimetables__inputWrapper"
      >
        {props.header2 && (
          <div>
            <h3>{props.header2}</h3>
            <SelectSearch
              options={[
                { name: "Assumption College", value: "ASSUMPTION" },
                { name: "The Newton", value: "NEWTON" },
                { name: "The Essence", value: "ESSENCE" },
                {
                  name: "Patumwan Demonstration School",
                  value: "SATHIT_PATHUMWAN",
                },
                {
                  name: "Assumption College Thonburi",
                  value: "ASSUMPTION_THON",
                },
              ]}
              value={selectedSchool}
              filterOptions={fuzzySearch}
              placeholder={props.placeholder2}
              // @ts-ignore
              onChange={setSelectedSchool}
              emptyMessage={() => "School Not Found"}
              search
            />
          </div>
        )}

        <div>
          <h3>{props.header}</h3>
          <SelectSearch
            options={[]}
            getOptions={(query) => {
              return new Promise((resolve, reject) => {
                fetch(
                  `https://apis.ssdevelopers.xyz/timetables/getClassFromSchool?school=${selectedSchool}`,
                  {
                    headers: {
                      Authorization: "Bearer " + localStorage.getItem("token"),
                    },
                  }
                )
                  .then((response) => response.json())
                  .then((data) => {
                    resolve(
                      data.response.map(({ name, value }) => ({
                        value,
                        name,
                      }))
                    );
                  })
                  .catch(reject);
              });
            }}
            value={selectedOption}
            filterOptions={fuzzySearch}
            placeholder={props.placeholder}
            // @ts-ignore
            onChange={setSelectedOption}
            emptyMessage={() => "Timetable not found"}
            search
          />
        </div>

        <ColoredButton
          onSubmit={submitHandler}
          type={"setupTimetables__submit"}
          className={{ right: "2rem !important" }}
          style={{}}
          text={props.button}
        />
      </motion.div>
    </form>
  );
};

export default SetupTimetableItem;
