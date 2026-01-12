import { lazy } from 'react'
import { Route } from 'react-router'

// leave-request
const LeaveRequestPage = lazy(() => import('@/_workspace/pages/leave-request/page'))

// leave-history
const LeaveHistoryPage = lazy(() => import('@/_workspace/pages/leave-history/page'))

// leave-document
const LeaveDocumentPage = lazy(() => import('@/_workspace/pages/leave-document/page'))

// employee-leave
const EmployeeLeavePage = lazy(() => import('@/_workspace/pages/employee-leave/page'))

// leave-approval
const LeaveApprovalPage = lazy(() => import('@/_workspace/pages/leave-approval/page'))

// leave-al-remain
const LeaveAlRemainPage = lazy(() => import('@/_workspace/pages/leave-al-remain/page'))

//check-subordinate-leave
const SubordinateLeavePage = lazy(() => import('@/_workspace/pages/check-subordinate-leave/page'))

//time-record-request
const TimeRecordRequestPage = lazy(() => import('@/_workspace/pages/time-record-request/page'))

// remain-leave
const RemainLeavePage = lazy(() => import('@/_workspace/pages/remain-leave/page'))

// hr-checker
const HrCheckerPage = lazy(() => import('@/_workspace/pages/check-employee-leave/page'))

// leave-type-setting
const LeaveTypeSettingPage = lazy(() => import('@/_workspace/pages/leave-type-name/page'))

// flex-time-request
const FlexTimeRequestPage = lazy(() => import('@/_workspace/pages/flex-time-request/page'))

// flex-time-history
const FlexTimeHistoryPage = lazy(() => import('@/_workspace/pages/flex-time-history/page'))

// flex-time-approval
const FlexTimeApprovalPage = lazy(() => import('@/_workspace/pages/flex-time-approval/page'))

const CheckSubordinateLeave = lazy(() => import('@/_workspace/pages/check-subordinate-leave/page'))

const LeaveM75Page = lazy(() => import('@/_workspace/pages/hr-check-employee-leave-m75/page'))

const LeaveRequestHrPage = lazy(() => import('@/_workspace/pages/hr-leave-request/page'))

const LeaveM75FormPage = lazy(() => import('@/_workspace/pages/hr-m75-form/page'))

const ExcelFormPage = lazy(() => import('@/_workspace/pages/hr-excel-form/page'))

const DocumentPage = lazy(() => import('@/_workspace/pages/hr-document/page'))

const LeaveTypePage = lazy(() => import('@/_workspace/pages/hr-leave-type-name/page'))

const HrLeaveTypeSettingPage = lazy(() => import('@/_workspace/pages/hr-leave-type-regulation/page'))

const UserLeavePage = lazy(() => import('@/_workspace/pages/hr-user-leave/page'))

const UserProbationPage = lazy(() => import('@/_workspace/pages/hr-user-probation/page'))

const TimeRecordHistoryPage = lazy(() => import('@/_workspace/pages/time-record-history/page'))

// New: Time Record Approval
const TimeRecordApprovalPage = lazy(() => import('@/_workspace/pages/time-record-approval/page'))

// New: Time Record Checker
const TimeRecordCheckerPage = lazy(() => import('@/_workspace/pages/time-record-checker/page'))

// New: Check Subordinate Time Record
const CheckSubordinateTimeRecordPage = lazy(() => import('@/_workspace/pages/check-subordinate-time-record/page'))

// New: Employee Flex Time
const EmployeeFlexTimePage = lazy(() => import('@/_workspace/pages/employee-flex-time/page'))

// New: Subordinate Flex Time
const SubordinateFlexTimePage = lazy(() => import('@/_workspace/pages/subordinate-flex-time/page'))

// New: Edit User Flex Time
const EditUserFlexTimePage = lazy(() => import('@/_workspace/pages/edit-user-flex-time/page'))

import { Outlet, useParams, Navigate } from 'react-router'
import { i18n } from '@configs/i18n'

const LanguageWrapper = () => {
  const { lang } = useParams()
  if (!i18n.locales.includes(lang as any)) {
    return <Navigate to={`/${i18n.defaultLocale}/leave-request`} replace />
  }
  return <Outlet />
}

export default (
  <>
    <Route path='/' element={<Navigate to='/en/home' replace />} />

    {/* (/:lang) */}
    <Route path='/:lang' element={<LanguageWrapper />}>
      {/* leave-request */}
      <Route path='leave-request' element={<LeaveRequestPage />} />

      {/* leave-history */}
      <Route path='leave-history' element={<LeaveHistoryPage />} />

      {/* leave-document */}
      <Route path='leave-document' element={<LeaveDocumentPage />} />

      {/* employee-leave */}
      <Route path='employee-leave' element={<EmployeeLeavePage />} />

      {/* leave-al-remain */}
      <Route path='al-remain' element={<LeaveAlRemainPage />} />

      {/* leave-approval */}
      <Route path='leave-approval' element={<LeaveApprovalPage />} />

      <Route path='remain-leave' element={<RemainLeavePage />} />
      {/* check-subordinate-leave */}
      <Route path='check-subordinate-leave' element={<SubordinateLeavePage />} />

      {/* time-record-request */}
      <Route path='time-record-request' element={<TimeRecordRequestPage />} />

      {/* time-record-history */}
      <Route path='time-record-history' element={<TimeRecordHistoryPage />} />

      {/* hr-checker */}
      <Route path='checkemployee-leave' element={<HrCheckerPage />} />

      {/* leave-type-setting */}
      <Route path='leave-type-name' element={<LeaveTypeSettingPage />} />

      {/* flex-time-request */}
      <Route path='flex-time-request' element={<FlexTimeRequestPage />} />

      {/* flex-time-history */}
      <Route path='flex-time-history' element={<FlexTimeHistoryPage />} />

      {/* flex-time-approval */}
      <Route path='flex-time-approval' element={<FlexTimeApprovalPage />} />

      {/* subordinate-leave */}
      <Route path='subordinate-leave' element={<CheckSubordinateLeave />} />

      {/* check-employee-leave-m75 */}
      <Route path='hr-check-m75' element={<LeaveM75Page />} />

      {/* leave-request-hr */}
      <Route path='leave-request-form-hr' element={<LeaveRequestHrPage />} />

      {/*m75-form*/}
      <Route path='m75-Form-hr' element={<LeaveM75FormPage />} />

      {/* excel-form */}
      <Route path='excel-form-hr' element={<ExcelFormPage />} />

      {/* hr-document */}
      <Route path='document-hr' element={<DocumentPage />} />

      {/* hr-leave-type */}
      <Route path='leave-type-name-hr' element={<LeaveTypePage />} />

      {/* hr-leave-type-setting */}
      <Route path='leave-type-regulation-hr' element={<HrLeaveTypeSettingPage />} />

      {/* hr-user-leave */}
      <Route path='user-leave-hr' element={<UserLeavePage />} />

      {/* hr-user-probation */}
      <Route path='user-probation-hr' element={<UserProbationPage />} />

      {/* time-record-approval */}
      <Route path='time-record-approval' element={<TimeRecordApprovalPage />} />

      {/* time-record-checker */}
      <Route path='time-record-checker' element={<TimeRecordCheckerPage />} />

      {/* check-subordinate-time-record */}
      <Route path='check-subordinate-time-record' element={<CheckSubordinateTimeRecordPage />} />

      {/* employee-flex-time */}
      <Route path='flex-time-employee' element={<EmployeeFlexTimePage />} />

      {/* subordinate-flex-time */}
      <Route path='flex-time-subordinate' element={<SubordinateFlexTimePage />} />

      {/* edit-user-flex-time */}
      <Route path='flex-time-edit-user' element={<EditUserFlexTimePage />} />
    </Route>
  </>
)
