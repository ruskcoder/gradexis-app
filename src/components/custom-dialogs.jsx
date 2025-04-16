import React, { useState, useEffect } from "react";
import { Checkbox, List, ListInput, Button } from "framework7-react";

const WhatIfEditDialog = ({ layout, startingGrade, badges }) => {
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

  return (
    <>
      <div className="margin-top-half">
        <Checkbox
          name="checkbox-2"
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
          className="no-margin grade-input margin-bottom-half"
        ></ListInput>
      </List>
      {layout == "md" && (
        <Button fill onClick={() => window.f7alert.close()}>
          Done
        </Button>
      )}
    </>
  );
};

export { WhatIfEditDialog };