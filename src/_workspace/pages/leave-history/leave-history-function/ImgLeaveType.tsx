import cake_birthday from "../asset/logo/icons8-birthday-94.png";
import specialLeaveImg from "../asset/logo/icons8-crown-48.png";
import businessLeaveImg from "../asset/logo/icons8-fast-track-48.png";
import funeralImg from "../asset/logo/icons8-funeral-48.png";
import island from "../asset/logo/icons8-holiday-48 (1).png";
import defaultLeaveImg from "../asset/logo/icons8-image-48.png";
import priesthoodLeaveImg from "../asset/logo/icons8-monk-64 (1).png";
import weddingImg from "../asset/logo/icons8-romance-48.png";
import militaryLeaveImg from "../asset/logo/icons8-soldier-man-48.png";
import annualLeaveEmergencyImg from "../asset/logo/icons8-urgent-property-48.png";
import vaccineCovidLeaveImg from "../asset/logo/icons8-vaccine-64.png";
import otherLeaveImg from "../asset/logo/icons8-view-more-48.png";
import sickLeaveImg from "../asset/logo/icons8-vomiting-48.png";
import workFromHomeLeaveImg from "../asset/logo/icons8-work-from-home-58.png";
import maternityLeaveImg from "../asset/logo/icons8-maternity-64.png";
import productionLineStopImg from "../asset/logo/icons8-production-line-80.png";
import seminarImg from "../asset/logo/icons8-seminar-64.png";
import trainingImg from "../asset/logo/icons8-training-100.png";
import outsideWorkingImg from "../asset/logo/icons8-people-working-together-64.png";
import overSeaImg from "../asset/logo/icons8-airplane-take-off-100.png";
import flexTimeImg from "../asset/logo/flex-time.png";
import timeRecordImg from "../asset/logo/time-record.png";
const getImgLeaveType = (leaveTypeId: number) => {
  switch (leaveTypeId) {
    case 1:
      return <img src={island} alt="" width={28} />;
    case 2:
      return <img src={cake_birthday} alt="" width={28} />;
    case 3:
      return <img src={businessLeaveImg} alt="" width={28} />;
    case 4:
      return <img src={funeralImg} alt="" width={28} />;
    case 5:
      return <img src={weddingImg} alt="" width={28} />;
    case 6:
      return <img src={maternityLeaveImg} alt="" width={28} />;
    case 7:
      return <img src={militaryLeaveImg} alt="" width={28} />;
    case 8:
      return <img src={priesthoodLeaveImg} alt="" width={28} />;
    case 9:
      return <img src={sickLeaveImg} alt="" width={28} />;
    case 10:
      return <img src={specialLeaveImg} alt="" width={28} />;
    case 11:
      return <img src={workFromHomeLeaveImg} alt="" width={28} />;
    case 12:
      return <img src={annualLeaveEmergencyImg} alt="" width={28} />;
    case 13:
      return <img src={otherLeaveImg} alt="" width={28} />;
    case 14:
      return <img src={vaccineCovidLeaveImg} alt="" width={28} />;
    case 15:
      return <img src={productionLineStopImg} alt="" width={28} />;
    case 17:
      return <img src={outsideWorkingImg} alt="" width={28} />;
    case 18:
      return <img src={trainingImg} alt="" width={28} />;
    case 19:
      return <img src={seminarImg} alt="" width={28} />;
    case 20:
      return <img src={overSeaImg} alt="" width={28} />;
    case 24:
      return <img src={flexTimeImg} alt="" width={28} />;
    case 25:
      return <img src={timeRecordImg} alt="" width={28} />;
    default:
      return <img src={defaultLeaveImg} alt="" width={28} />;
  }
};
export { getImgLeaveType };
