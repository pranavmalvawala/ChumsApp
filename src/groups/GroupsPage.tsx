import React from "react";
import {
  ApiHelper,
  DisplayBox,
  GroupInterface,
  GroupAdd,
  UserHelper,
  ExportLink,
  Permissions
} from "./components";
import { Link } from "react-router-dom";
import { Row, Col, Table } from "react-bootstrap";

export const GroupsPage = () => {
  const [groups, setGroups] = React.useState<GroupInterface[]>([]);
  const [showAdd, setShowAdd] = React.useState(false);

  const getEditContent = () => {
    if (!UserHelper.checkAccess(Permissions.membershipApi.groups.edit)) return null;
    else
      return (
        <>
          <ExportLink data={groups} spaceAfter={true} filename="groups.csv" />{" "}
          <a
            href="about:blank"
            data-cy="add-button"
            onClick={(e: React.MouseEvent) => {
              e.preventDefault();
              setShowAdd(true);
            }}
          >
            <i className="fas fa-plus"></i>
          </a>
        </>
      );
  };

  const handleAddUpdated = () => {
    setShowAdd(false);
    loadData();
  };
  const loadData = () => {
    ApiHelper.get("/groups", "MembershipApi").then((data) => {
      setGroups(data);
    });
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const getRows = () => {
    var rows = [];
    var lastCat = "";
    for (var i = 0; i < groups.length; i++) {
      var g = groups[i];
      var cat =
        g.categoryName !== lastCat ? (
          <>
            <i className="far fa-folder"></i> {g.categoryName}
          </>
        ) : (
            <></>
          );
      var memberCount =
        g.memberCount === 1 ? "1 person" : g.memberCount.toString() + " people";
      rows.push(
        <tr key={g.id}>
          <td>{cat}</td>
          <td>
            <i className="fas fa-list"></i>{" "}
            <Link to={"/groups/" + g.id.toString()}>{g.name}</Link>
          </td>
          <td>{memberCount}</td>
        </tr>
      );
      lastCat = g.categoryName;
    }
    return rows;
  };

  var addBox = showAdd ? (
    <GroupAdd updatedFunction={handleAddUpdated} />
  ) : (
      <></>
    );

  if (!UserHelper.checkAccess(Permissions.membershipApi.groups.view)) return <></>;
  else
    return (
      <>
        <h1>
          <i className="fas fa-list"></i> Groups
        </h1>
        <Row>
          <Col lg={8}>
            <DisplayBox
              id="groupsBox"
              headerIcon="fas fa-list"
              headerText="Groups"
              editContent={getEditContent()}
            >
              <Table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Name</th>
                    <th>People</th>
                  </tr>
                </thead>
                <tbody>{getRows()}</tbody>
              </Table>
            </DisplayBox>
          </Col>
          <Col lg={4}>{addBox}</Col>
        </Row>
      </>
    );
};