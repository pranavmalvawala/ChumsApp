import React from "react";
import { ApiHelper, DisplayBox, UserHelper, FormInterface, QuestionInterface, FormQuestionEdit, Permissions, Loading } from "./components";
import { RouteComponentProps } from "react-router-dom"
import { Row, Col, Table } from "react-bootstrap";

type TParams = { id?: string };
export const FormPage = ({ match }: RouteComponentProps<TParams>) => {
  const [form, setForm] = React.useState<FormInterface>({} as FormInterface);
  const [questions, setQuestions] = React.useState<QuestionInterface[]>(null);
  const [editQuestionId, setEditQuestionId] = React.useState("notset");

  const questionUpdated = () => { loadQuestions(); setEditQuestionId("notset"); }
  const loadData = () => { ApiHelper.get("/forms/" + match.params.id, "MembershipApi").then(data => setForm(data)); loadQuestions(); }
  const loadQuestions = () => ApiHelper.get("/questions?formId=" + match.params.id, "MembershipApi").then(data => setQuestions(data));
  const getEditContent = () => (<a href="about:blank" data-cy="edit-question-button" onClick={(e: React.MouseEvent) => { e.preventDefault(); setEditQuestionId(""); }}><i className="fas fa-plus"></i></a>)
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    let anchor = e.currentTarget as HTMLAnchorElement;
    let row = anchor.parentNode.parentNode as HTMLElement;
    let idx = parseInt(row.getAttribute("data-index"));
    setEditQuestionId(questions[idx].id);
  }

  const moveUp = (e: React.MouseEvent) => {
    e.preventDefault();
    let anchor = e.currentTarget as HTMLAnchorElement;
    let row = anchor.parentNode.parentNode as HTMLElement;
    let idx = parseInt(row.getAttribute("data-index"));
    let tmpQuestions = [...questions];
    let question = tmpQuestions.splice(idx, 1)[0];
    tmpQuestions.splice(idx - 1, 0, question);
    setQuestions(tmpQuestions);
    ApiHelper.get("/questions/sort/" + question.id + "/up", "MembershipApi");
  }

  const moveDown = (e: React.MouseEvent) => {
    e.preventDefault();
    let anchor = e.currentTarget as HTMLAnchorElement;
    let row = anchor.parentNode.parentNode as HTMLElement;
    let idx = parseInt(row.getAttribute("data-index"));
    let tmpQuestions = [...questions];
    let question = tmpQuestions.splice(idx, 1)[0];
    tmpQuestions.splice(idx + 1, 0, question);
    setQuestions(tmpQuestions);
    ApiHelper.get("/questions/sort/" + question.id + "/down", "MembershipApi");
  }

  const getRows = () => {
    const rows: JSX.Element[] = [];
    if (questions.length === 0) {
      rows.push(<tr key="0">No custom questions have been created yet.  Questions will be listed here.</tr>);
      return rows;
    }
    for (let i = 0; i < questions.length; i++) {
      let upArrow = (i === 0) ? <span style={{ display: "inline-block", width: 20 }} /> : <><a href="about:blank" onClick={moveUp}><i className="fas fa-arrow-up" /></a> </>
      let downArrow = (i === questions.length - 1) ? <></> : <> &nbsp; <a href="about:blank" onClick={moveDown}><i className="fas fa-arrow-down" /></a></>
      rows.push(
        <tr key={i} data-index={i}>
          <td><a href="about:blank" onClick={handleClick}>{questions[i].title}</a></td>
          <td>{questions[i].fieldType}</td>
          <td style={{ textAlign: "left" }}>{upArrow}{downArrow}</td>
        </tr>
      );
    }
    return rows;
  }

  const getTableHeader = () => {
    const rows: JSX.Element[] = [];
    if (questions.length === 0) {
      return rows;
    }
    rows.push(<tr key="header"><th>Question</th><th>Type</th><th>Action</th></tr>);
    return rows;
  }

  const getSidebarModules = () => {
    let result = [];
    if (editQuestionId !== "notset") result.push(<FormQuestionEdit key="form-questions" questionId={editQuestionId} updatedFunction={questionUpdated} formId={form.id} />)
    return result;
  }

  React.useEffect(loadData, []);

  if (!UserHelper.checkAccess(Permissions.membershipApi.forms.edit)) return (<></>);
  else {
    let contents = <Loading />
    if (questions) {
      contents = (<Table>
        <thead>{getTableHeader()}</thead>
        <tbody>{getRows()}</tbody>
      </Table>);
    }
    return (
      <>
        <h1><i className="fas fa-align-left"></i> {form.name}</h1>
        <Row>
          <Col lg={8}>
            <DisplayBox id="questionsBox" headerText="Questions" headerIcon="fas fa-question" editContent={getEditContent()}>
              {contents}
            </DisplayBox>
          </Col>
          <Col lg={4}>{getSidebarModules()}</Col>
        </Row>
      </>
    );
  }
}
