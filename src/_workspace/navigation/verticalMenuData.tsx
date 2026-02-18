// Type Imports
import type { VerticalMenuDataType } from '@/types/menuTypes'
import type { getDictionary } from '@/utils/getDictionary'

const verticalMenuData = (dictionary: Awaited<ReturnType<typeof getDictionary>>): VerticalMenuDataType[] => [
  {
    label: dictionary['navigation'].home,
    icon: 'tabler-home',
    href: '/home'
  },
  {
    label: dictionary['navigation'].Setting,
    isSection: true
  },
  {
    label: dictionary['navigation'].emailSetting,
    id: 533,
    icon: 'tabler-mail',
    href: '/email-setting'
  },
  {
    label: dictionary['navigation'].menu,
    isSection: true
  },

  // Leave System Menu
  {
    label: dictionary['navigation'].leaveRequest,
    id: 490,
    icon: 'tabler-clipboard-text',
    href: '/leave-request'
  },
  {
    label: dictionary['navigation'].leaveHistory,
    id: 496,
    icon: 'tabler-history',
    href: '/leave-history'
  },
  {
    label: dictionary['navigation'].leaveDocument,
    id: 497,
    icon: 'tabler-file-info',
    href: '/leave-document'
  },
  {
    label: dictionary['navigation'].employeeLeave,
    id: 498,
    icon: 'tabler-file-report',
    href: '/employee-leave'
  },
  {
    label: dictionary['navigation'].approvalMenu,
    isSection: true
  },
  {
    label: dictionary['navigation'].leaveApproval,
    id: 499,
    icon: 'tabler-checkbox',
    href: '/leave-approval'
  },
  {
    label: dictionary['navigation'].alRemain,
    id: 500,
    icon: 'tabler-device-desktop',
    href: '/al-remain'
  },
  {
    label: dictionary['navigation'].checkSorbordinateLeave,
    id: 501,
    icon: 'tabler-device-desktop-analytics',
    href: '/subordinate-leave'
  },
  {
    label: dictionary['navigation'].humanresourcemenu,
    isSection: true
  },
  {
    label: dictionary['navigation'].remainLeave,
    id: 502,
    icon: 'tabler-backpack',
    href: '/remain-leave'
  },
  {
    label: dictionary['navigation'].checkEmployeeLeave,
    id: 503,
    icon: 'tabler-calendar-check',
    href: '/checkemployee-leave'
  },
  {
    label: dictionary['navigation'].checkEmployeeLeaveM75,
    id: 504,
    icon: 'tabler-number-75-small',
    href: '/hr-check-m75'
  },
  {
    label: dictionary['navigation'].hrCreate,
    icon: 'tabler-file-diff',
    id: 505,
    defaultOpen: true,
    children: [
      {
        id: 506,
        label: dictionary['navigation'].leaveRequestForm,
        icon: 'tabler-file-diff',
        href: '/leave-request-form-hr'
      },
      {
        id: 507,
        label: dictionary['navigation'].m75Form,
        icon: 'tabler-file-diff',
        href: '/m75-Form-hr'
      },
      {
        id: 508,
        label: dictionary['navigation'].excelForm,
        icon: 'tabler-file-diff',
        href: '/excel-form-hr'
      }
    ]
  },
  {
    label: dictionary['navigation'].hrSetting,
    icon: 'tabler-file-settings',
    id: 509,
    defaultOpen: true,
    children: [
      {
        id: 510,
        label: dictionary['navigation'].document,
        icon: 'tabler-file-settings',
        href: '/document-hr'
      },
      {
        id: 511,
        label: dictionary['navigation'].leaveTypeName,
        icon: 'tabler-file-settings',
        href: '/leave-type-name-hr'
      },
      {
        id: 512,
        label: dictionary['navigation'].leaveTypeRegulation,
        icon: 'tabler-file-settings',
        href: '/leave-type-regulation-hr'
      }
    ]
  },
  {
    label: dictionary['navigation'].hrEdit,
    icon: 'tabler-file-pencil',
    id: 513,
    defaultOpen: true,
    children: [
      {
        id: 514,
        label: dictionary['navigation'].userLeave,
        icon: 'tabler-file-pencil',
        href: '/user-leave-hr'
      },
      {
        id: 515,
        label: dictionary['navigation'].userProbation,
        icon: 'tabler-file-pencil',
        href: '/user-probation-hr'
      }
    ]
  },
  {
    label: dictionary['navigation'].flexTimeMenu,
    isSection: true
  },
  {
    label: dictionary['navigation'].flexTimeRequest,
    id: 521,
    icon: 'tabler-clipboard-text',
    href: '/flex-time-request'
  },
  {
    label: dictionary['navigation'].flexTimeHistory,
    id: 522,
    icon: 'tabler-history',
    href: '/flex-time-history'
  },
  {
    label: dictionary['navigation'].flexTimeApproval,
    id: 526,
    icon: 'tabler-checkbox',
    href: '/flex-time-approval'
  },
  {
    label: dictionary['navigation'].employeeFlexTime,
    id: 523,
    icon: 'tabler-file-report',
    href: '/flex-time-employee'
  },
  {
    label: dictionary['navigation'].subordinateFlexTime,
    id: 524,
    icon: 'tabler-device-desktop-analytics',
    href: '/flex-time-subordinate'
  },
  {
    label: dictionary['navigation'].editUserFlexTime,
    id: 525,
    icon: 'tabler-file-pencil',
    href: '/flex-time-edit-user'
  },

  {
    label: dictionary['navigation'].timeRecordMenu,
    isSection: true
  },
  {
    label: dictionary['navigation'].timeRecordRequest,
    id: 516,
    icon: 'tabler-report',
    href: '/time-record-request'
  },
  {
    label: dictionary['navigation'].timeRecordHistory,
    id: 517,
    icon: 'tabler-history',
    href: '/time-record-history'
  },
  {
    label: dictionary['navigation'].timeRecordApproval,
    id: 518,
    icon: 'tabler-checkbox',
    href: '/time-record-approval'
  },
  {
    label: dictionary['navigation'].timeRecordChecker,
    id: 519,
    icon: 'tabler-checklist',
    href: '/time-record-checker'
  },
  {
    label: dictionary['navigation'].checkSubordinateTimeRecord,
    id: 520,
    icon: 'tabler-device-desktop-check',
    href: '/check-subordinate-time-record'
  }

  // {
  //   id: 358,
  //   label: dictionary['navigation'].boiUnit,
  //   icon: 'tabler-circle',
  //   href: '/boi-unit'
  // },
  // {
  //   label: dictionary['navigation'].boiCategory,
  //   icon: 'tabler-square',
  //   id: 359,
  //   defaultOpen: true,
  //   children: [
  //     {
  //       id: 342,
  //       label: dictionary['navigation'].boiNameForMaterialConsumable,
  //       icon: 'tabler-circle',
  //       href: '/boi-name-for-material-consumable'
  //     }
  //   ]
  // }
]

export default verticalMenuData
