import React, { useState, useEffect, useRef } from "react";
import { Checkbox, List, ListInput, Button, ListItem, Icon, f7, Sheet } from "framework7-react";
import store from "../js/store";
import { callback } from "chart.js/helpers";

const WhatIfEditDialog = ({ layout, startingGrade, badges, callback }) => {
  const [checked, setIsChecked] = useState(false);
  const [grade, setGrade] = useState(startingGrade);

  useEffect(() => {
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

const WhatIfAddCategoryDialog = ({layout, callback}) => {
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");

  useEffect(() => {
    window.currentWhatIfEdit = {
      name: name,
      weight: weight,
    };
  }, [name, weight]);

  return (
    <>
      <List className="no-margin margin-top-half">
        <ListInput
          outline
          label="Category Name"
          type="text"
          placeholder="Enter category name"
          floatingLabel
          clearButton
          value={name}
          onInput={(e) => setName(e.target.value)}
          className="no-margin dialog-input"
        ></ListInput>
        <ListInput
          outline
          label="Weight"
          type="number"
          placeholder="Enter weight (e.g., 60.00)"
          floatingLabel
          clearButton
          validate
          required
          value={weight}
          onInput={(e) => setWeight(e.target.value)}
          className="no-margin dialog-input"
        ></ListInput>
      </List>
      {layout == "md" && (
        <Button fill className="margin-top" onClick={() => { window.f7alert.close(); callback(name ? name : "Untitled Category", weight) }}>
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
          values: [...categories, "Add Category"],
        },
      ],
      on: {
        change(picker, values) {
          setCategory(values[0]);
        },
      },
    });
  }, [categories]);
  const changeCategory = (cat) => {
    setCategory(cat);
  };
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
        <ListItem title="Category" smartSelect smartSelectParams={{
          openIn: 'popover',
        }}>
          <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
            <option value="Add Category">Add Category</option>
          </select>
        </ListItem>
      </List>
      {layout == "md" && (
        <Button fill className="margin-top" onClick={() => { window.f7alert.close(); callback(name ? name : "Untitled Assignment", score, category) }}>
          Done
        </Button>
      )}
    </>
  );
};


export { WhatIfEditDialog, WhatIfAddDialog, WhatIfAddCategoryDialog };