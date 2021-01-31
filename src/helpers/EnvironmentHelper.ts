import { ApiHelper } from "../appBase/helpers/ApiHelper";

export class EnvironmentHelper {
    private static AccessApi = "";
    private static AttendanceApi = "";
    private static GivingApi = "";
    private static MembershipApi = "";
    private static ChumsApi = "";
    static ContentRoot = "";
    static GoogleAnalyticsTag = "";

    static init = () => {
        switch (process.env.REACT_APP_STAGE) {
            case "staging": EnvironmentHelper.initStaging(); break;
            case "prod": EnvironmentHelper.initProd(); break;
            default: EnvironmentHelper.initDev(); break;
        }
        ApiHelper.apiConfigs = [
            { keyName: "AccessApi", url: EnvironmentHelper.AccessApi, jwt: "", permisssions: [] },
            { keyName: "AttendanceApi", url: EnvironmentHelper.AttendanceApi, jwt: "", permisssions: [] },
            { keyName: "GivingApi", url: EnvironmentHelper.GivingApi, jwt: "", permisssions: [] },
            { keyName: "MembershipApi", url: EnvironmentHelper.MembershipApi, jwt: "", permisssions: [] },
        ];
        ApiHelper.defaultApi = "MembershipApi";
    }

    static initDev = () => {
        EnvironmentHelper.AccessApi = process.env.REACT_APP_ACCESS_API || "";
        EnvironmentHelper.AttendanceApi = process.env.REACT_APP_ATTENDANCE_API || "";
        EnvironmentHelper.GivingApi = process.env.REACT_APP_GIVING_API || "";
        EnvironmentHelper.MembershipApi = process.env.REACT_APP_MEMBERSHIP_API || "";
        EnvironmentHelper.ChumsApi = process.env.REACT_APP_CHUMS_API || "";
        EnvironmentHelper.ContentRoot = process.env.REACT_APP_CONTENT_ROOT || "";
        EnvironmentHelper.GoogleAnalyticsTag = process.env.REACT_APP_GOOGLE_ANALYTICS || "";
    }

    //NOTE: None of these values are secret.
    static initStaging = () => {
        EnvironmentHelper.AccessApi = "https://accessapi.staging.churchapps.org";
        EnvironmentHelper.AttendanceApi = "https://attendanceapi.staging.churchapps.org";
        EnvironmentHelper.GivingApi = "https://givingapi.staging.churchapps.org";
        EnvironmentHelper.MembershipApi = "https://membershipapi.staging.churchapps.org";
        EnvironmentHelper.ChumsApi = "https://api.staging.chums.org";
        EnvironmentHelper.ContentRoot = "";
        EnvironmentHelper.GoogleAnalyticsTag = "";
    }

    //NOTE: None of these values are secret.
    static initProd = () => {
        EnvironmentHelper.AccessApi = "https://accessapi.churchapps.org";
        EnvironmentHelper.AttendanceApi = "https://attendanceapi.churchapps.org";
        EnvironmentHelper.GivingApi = "https://givingapi.churchapps.org";
        EnvironmentHelper.MembershipApi = "https://membershipapi.churchapps.org";
        EnvironmentHelper.ChumsApi = "https://api.chums.org";
        EnvironmentHelper.ContentRoot = "";
        EnvironmentHelper.GoogleAnalyticsTag = "UA-164774603-4";
    }

}
