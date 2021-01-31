import React, { useRef, useCallback } from "react";
import { ApiHelper, DisplayBox, BatchEdit, DonationBatchInterface, Helper, Funds, UserHelper, ExportLink, DonationSummaryInterface, Permissions } from "./components";
import { Link } from "react-router-dom";
import { Row, Col, Table } from "react-bootstrap";
import { ReportFilterInterface, ReportInterface } from "../appBase/interfaces/ReportInterfaces";
import { ReportWithFilter } from "../appBase/components/reporting/ReportWithFilter";
import { ArrayHelper, DateHelper } from "../appBase/helpers";

export const DonationsPage = () => {
    const [editBatchId, setEditBatchId] = React.useState(-1);
    const [batches, setBatches] = React.useState<DonationBatchInterface[]>([]);
    const isSubscribed = useRef(true)

    const getFilter = (): ReportFilterInterface => {
        return ({
            keyName: "donationSummaryFilter",
            fields: [
                { keyName: "startDate", displayName: "Start Date", dataType: "date", value: DateHelper.addDays(new Date(), -365) },
                { keyName: "endDate", displayName: "End Date", dataType: "date", value: new Date() }
            ]
        });
    }
    const loadReport = async (filter: ReportFilterInterface) => {
        if (filter === null) return;
        const startDate = ArrayHelper.getOne(filter.fields, "keyName", "startDate").value;
        const endDate = ArrayHelper.getOne(filter.fields, "keyName", "endDate").value;

        return ApiHelper.get("/donations/summary?startDate=" + DateHelper.formatHtml5Date(startDate) + "&endDate=" + DateHelper.formatHtml5Date(endDate), "GivingApi").then((summary) => {
            const r: ReportInterface = {
                headings: [
                    { name: "Week", field: "week" },
                    { name: "Fund", field: "fundName" },
                    { name: "Amount", field: "totalAmount" },
                ],
                groupings: ["week", "fundName"],
                data: convertSummaryToReportData(summary),
                title: "Donation Summary",
                keyName: "donationSummary",
                reportType: "Bar Chart"
            };
            return r;
        })
    }

    const convertSummaryToReportData = (summary: DonationSummaryInterface[]) => {
        const result: any[] = [];
        summary.forEach(s => {
            s.donations.forEach((d: any) => {
                result.push({
                    week: Helper.prettyDate(new Date(s.week)),
                    fundName: (d.fund === undefined) ? "none" : d.fund.name,
                    totalAmount: d.totalAmount
                });
            });
        });
        return result;
    }

    const showAddBatch = (e: React.MouseEvent) => { e.preventDefault(); setEditBatchId(0); }
    const showEditBatch = (e: React.MouseEvent) => {
        e.preventDefault();
        var anchor = e.currentTarget as HTMLAnchorElement;
        var id = parseInt(anchor.getAttribute("data-id"));
        setEditBatchId(id);
    }
    const batchUpdated = () => { setEditBatchId(-1); loadData(); }
    const loadData = useCallback(() => {
        ApiHelper.get("/donationbatches", "GivingApi").then(data => { if (isSubscribed.current) { setBatches(data); console.log(data) } });
    }, [])



    const getEditContent = () => {
        return (UserHelper.checkAccess(Permissions.givingApi.donations.edit)) ? (<><ExportLink data={batches} spaceAfter={true} filename="donationbatches.csv" /><a href="about:blank" onClick={showAddBatch} ><i className="fas fa-plus"></i></a></>) : null;
    }


    const getSidebarModules = () => {
        var result = [];
        //result.push(<ReportFilter key={result.length - 1} filter={filter} updateFunction={handleFilterUpdate} />);
        if (editBatchId > -1) result.push(<BatchEdit key={result.length - 1} batchId={editBatchId} updatedFunction={batchUpdated} />)
        result.push(<Funds key={result.length - 1} />);
        return result;
    }

    const getRows = () => {
        var result: React.ReactNode[] = [];
        var canEdit = UserHelper.checkAccess(Permissions.givingApi.donations.edit);
        var canViewBatcht = UserHelper.checkAccess(Permissions.givingApi.donations.view);
        for (let i = 0; i < batches.length; i++) {
            var b = batches[i];
            const editLink = (canEdit) ? (<a href="about:blank" data-id={b.id} onClick={showEditBatch}><i className="fas fa-pencil-alt" /></a>) : null;
            const batchLink = (canViewBatcht) ? (<Link to={"/donations/" + b.id}>{b.id}</Link>) : <>{b.id}</>;
            result.push(<tr key={i}>
                <td>{batchLink}</td>
                <td>{b.name}</td>
                <td>{Helper.prettyDate(b.batchDate)}</td>
                <td>{b.donationCount}</td>
                <td>{Helper.formatCurrency(b.totalAmount)}</td>
                <td>{editLink}</td>
            </tr>);
        }
        return result;
    }

    React.useEffect(() => { loadData(); return () => { isSubscribed.current = false } }, [batches, editBatchId, loadData]);

    if (!UserHelper.checkAccess(Permissions.givingApi.donations.viewSummary)) return (<></>);
    else return (
        <form method="post">
            <h1><i className="fas fa-hand-holding-usd"></i> Donations</h1>
            <ReportWithFilter fetchReport={loadReport} filter={getFilter()} />
            <Row>
                <Col lg={8}>
                    <DisplayBox id="batchesBox" headerIcon="fas fa-hand-holding-usd" headerText="Batches" editContent={getEditContent()}  >
                        <Table>
                            <tbody>
                                <tr><th>Id</th><th>Name</th><th>Date</th><th>Donations</th><th>Total</th><th>Edit</th></tr>
                                {getRows()}
                            </tbody>
                        </Table>
                    </DisplayBox >
                </Col>
                <Col lg={4}>{getSidebarModules()}</Col>
            </Row>
        </form >
    );
}