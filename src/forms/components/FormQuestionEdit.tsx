import React, { useState } from "react";
import { ApiHelper, InputBox, QuestionInterface, ChoicesEdit, UniqueIdHelper, ErrorMessages } from ".";

interface Props {
    questionId: string,
    formId: string,
    updatedFunction: () => void
}

export const FormQuestionEdit: React.FC<Props> = (props) => {
  const [question, setQuestion] = useState<QuestionInterface>({} as QuestionInterface);
  const [errors, setErrors] = useState<string[]>([]);

  const loadData = () => {
    if (!UniqueIdHelper.isMissing(props.questionId)) ApiHelper.get("/questions/" + props.questionId, "MembershipApi").then((data: QuestionInterface) => setQuestion(data));
    else setQuestion({ formId: props.formId, fieldType: "Textbox" } as QuestionInterface);
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let q = { ...question };
    switch (e.target.name) {
      case "title": q.title = e.currentTarget.value; break;
      case "description": q.description = e.currentTarget.value; break;
      case "placeholder": q.placeholder = e.currentTarget.value; break;
      case "fieldType": q.fieldType = e.target.value; break;
    }
    setQuestion(q);
  }

  const handleKeyDown = (e: React.KeyboardEvent<any>) => { if (e.key === "Enter") { e.preventDefault(); handleSave(); } }
  const handleChoicesUpdated = (q: QuestionInterface) => { setQuestion(q); }
  const handleSave = () => {
    let errors: string[] = [];
    if (!question.title?.trim()) errors.push("Please enter Title");
    if (errors.length > 0) {
      setErrors(errors);
      setQuestion({ ...question, title: "" });
      return;
    }

    setQuestion({ ...question, title: question.title.trim() });
    ApiHelper.post("/questions", [question], "MembershipApi").then(() => props.updatedFunction());
  }
  const handleCancel = () => props.updatedFunction();
  const handleDelete = () => {
    if (window.confirm("Are you sure you wish to permanently delete this question?")) {
      ApiHelper.delete("/questions/" + question.id, "MembershipApi").then(() => props.updatedFunction());
    }
  }

  const getTypeSpecific = () => {
    if (question.fieldType === "Multiple Choice") return (<ChoicesEdit question={question} updatedFunction={handleChoicesUpdated} />)
    else return (<div className="form-group">
      <label>Placeholder (optional)</label>
      <input type="text" className="form-control" data-cy="placeholder" name="placeholder" value={question.placeholder || ""} onChange={handleChange} />
    </div>);
  }

  React.useEffect(loadData, [props.questionId || props.formId]);

  return (
    <InputBox id="questionBox" headerIcon="fas fa-question" headerText="Edit Question" saveFunction={handleSave} cancelFunction={handleCancel} deleteFunction={(!UniqueIdHelper.isMissing(props.questionId)) ? handleDelete : undefined}>
      <ErrorMessages errors={errors} />
      <div className="form-group">
        <label>Question Type</label>
        <select className="form-control" data-cy="type" name="fieldType" value={question.fieldType} onChange={handleChange} onKeyDown={handleKeyDown}>
          <option value="Textbox">Textbox</option>
          <option value="Whole Number">Whole Number</option>
          <option value="Decimal">Decimal</option>
          <option value="Date">Date</option>
          <option value="Yes/No">Yes/No</option>
          <option value="Email">Email</option>
          <option value="Phone Number">Phone Number</option>
          <option value="Text Area">Text Area</option>
          <option value="Multiple Choice">Multiple Choice</option>
        </select>
      </div>
      <div className="form-group">
        <label>Title</label>
        <input type="text" className="form-control" data-cy="title" name="title" value={question.title} onChange={handleChange} onKeyDown={handleKeyDown} />
      </div>
      <div className="form-group">
        <label>Description (optional)</label>
        <input type="text" className="form-control" data-cy="description" name="description" value={question.description} onChange={handleChange} onKeyDown={handleKeyDown} />
      </div>
      {getTypeSpecific()}
    </InputBox>
  );
}
