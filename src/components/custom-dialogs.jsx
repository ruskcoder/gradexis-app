import React, { useState, useEffect, useRef } from "react";
import { Checkbox, List, ListInput, Button, ListItem, Icon, f7, f7ready } from "framework7-react";

const WhatIfEditDialog = ({ layout, startingGrade, badges, callback }) => {
  const [checked, setIsChecked] = useState(false);
  const [grade, setGrade] = useState(startingGrade);

  useEffect(() => {
    if (badges.includes("missing")) {
      setIsChecked(false);
      setGrade("0.00");
    }
    if (badges.includes("exempt")) {
      setIsChecked(true);
      setGrade("");
    }
  }, [badges]);
  useEffect(() => {
    window.currentWhatIfEdit = {
      checked: checked,
      grade: grade,
    };
  }, [checked, grade]);
  return (
    <>
      <div className="margin-top-half checkbox-container">
        <Checkbox
          name="checkbox"
          checked={checked}
          onChange={() => setIsChecked(!checked)}
          className="margin-right-half"
        ></Checkbox>
        Disable from calculation
      </div>

      <List className="no-margin margin-top-half">
        <ListInput
          outline
          label="New Grade"
          type="number"
          disabled={checked}
          placeholder="Ex: 100.00"
          floatingLabel
          clearButton
          value={grade}
          onInput={(e) => {
            setGrade(e.target.value);
          }}
          className="no-margin grade-input margin-bottom-half dialog-input"
        ></ListInput>
      </List>
      {layout == "md" && (
        <Button fill onClick={() => { window.f7alert.close(); callback(checked, grade) }}>
          Done
        </Button>
      )}
    </>
  );
};

const WhatIfAddDialog = ({ layout, categories, callback }) => {
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [category, setCategory] = useState("");
  const pickerCategory = useRef(null);

  useEffect(() => {
    pickerCategory.current = f7.picker.create({
      inputEl: "#category-select",
      toolbarCloseText: "Done",
      openIn: 'popover',
      cssClass: "picker-category",
      rotateEffect: false,
      cols: [
        {
          textAlign: "center",
          values: categories,
        },
      ],
      on: {
        change(picker, values) {
          setCategory(values[0]);
        },
      },
    });
  }, [categories]);

  useEffect(() => {
    window.currentWhatIfEdit = {
      name: name,
      score: score,
      category: category,
    };
  }, [name, score, category]);

  return (
    <>
      <List className="no-margin margin-top-half">
        <ListInput
          outline
          label="Name"
          type="text"
          placeholder="Enter name"
          floatingLabel
          clearButton
          value={name}
          validate
          required
          onInput={(e) => setName(e.target.value)}
          className="no-margin dialog-input"
        ></ListInput>
        <ListInput
          outline
          label="Score"
          type="number"
          placeholder="Enter score"
          floatingLabel
          clearButton
          validate
          required
          value={score}
          onInput={(e) => setScore(e.target.value)}
          className="no-margin dialog-input"
        ></ListInput>
        <ListInput
          placeholder="Select category"
          type="text"
          className="no-margin dialog-input"
          inputId={"category-select"}
          readonly
          outline
        >
        </ListInput>
      </List>
      {layout == "md" && (
        <Button fill className="margin-top" onClick={() => { window.f7alert.close(); callback(name, score, category) }}>
          Done
        </Button>
      )}
    </>
  );
};
export { WhatIfEditDialog, WhatIfAddDialog };