import { Personnel, Battery, ParadeDutyAssignment } from '../types';

export interface SimpleParadeSummary {
  battery: Battery | 'Consolidated';
  totalPosted: number;
  outOfUnit: number;
  presentInUnit: number;
  offParade: number; // All duty detailing added together
  onParade: number;  // Present in the Unit - Off Parade
  onParadePercentage: number;
  presentInUnitPercentage: number;
  outOfUnitBreakdown: {
    leave: number;
    course: number;
    sick: number;
    tempDuty: number;
    attachedOut: number;
    awol: number;
  };
  dutyBreakdown: {
    unitSy: number;
    working: number;
    fixedDuty: number;
    others: number;
  };
}

/**
 * Checks whether a personnel is physically away from the unit (Out of Unit).
 */
export function isPersonnelOutOfUnit(p: Personnel): boolean {
  if (
    p.status === 'Leave' ||
    p.status === 'Course/Trg' ||
    p.status === 'CMH/Sick' ||
    p.status === 'Temp Duty' ||
    p.status === 'Attached Out' ||
    p.status === 'AWOL/OSL'
  ) {
    return true;
  }
  if (Boolean(p.outOfUnitCategory)) {
    return true;
  }
  return false;
}

/**
 * Pure, simple parade state calculation:
 * 1. Present in Unit = Total Posted - Out of Unit
 * 2. Off Parade = Total Duty Detailing (all duties added together)
 * 3. On Parade = Present in Unit - Off Parade
 */
export function calculateSimpleParadeState(
  personnelList: Personnel[],
  dutyAssignments: ParadeDutyAssignment[],
  batteryScope: Battery | 'Consolidated' = 'Consolidated'
): SimpleParadeSummary {
  // 1. Filter personnel by battery scope
  const scopedPersonnel =
    batteryScope === 'Consolidated'
      ? personnelList
      : personnelList.filter((p) => p.battery === batteryScope);

  const totalPosted = scopedPersonnel.length;

  // 2. Count Out of Unit
  let leave = 0;
  let course = 0;
  let sick = 0;
  let tempDuty = 0;
  let attachedOut = 0;
  let awol = 0;

  scopedPersonnel.forEach((p) => {
    if (p.status === 'Leave' || p.outOfUnitCategory === 'P/Lve' || p.outOfUnitCategory === 'C/Lve') {
      leave++;
    } else if (p.status === 'Course/Trg' || p.outOfUnitCategory === 'Course') {
      course++;
    } else if (p.status === 'CMH/Sick' || p.outOfUnitCategory === 'CMH') {
      sick++;
    } else if (p.status === 'Temp Duty' || p.outOfUnitCategory === 'Comd') {
      tempDuty++;
    } else if (
      p.status === 'Attached Out' ||
      p.outOfUnitCategory === 'Att' ||
      p.outOfUnitCategory === 'ERE' ||
      p.outOfUnitCategory === 'Msn' ||
      p.outOfUnitCategory === 'FDMN'
    ) {
      attachedOut++;
    } else if (p.status === 'AWOL/OSL') {
      awol++;
    }
  });

  const outOfUnit = leave + course + sick + tempDuty + attachedOut + awol;

  // 3. Present in the Unit
  const presentInUnit = Math.max(0, totalPosted - outOfUnit);

  // 4. Off Parade = All duty detailing added together
  const scopedDuties =
    batteryScope === 'Consolidated'
      ? dutyAssignments
      : dutyAssignments.filter((d) => d.battery === batteryScope);

  const offParade = scopedDuties.length;

  let unitSy = 0;
  let working = 0;
  let fixedDuty = 0;
  let others = 0;

  scopedDuties.forEach((d) => {
    if (d.category === 'Unit Sy') unitSy++;
    else if (d.category === 'working') working++;
    else if (d.category === 'Fixed Duty') fixedDuty++;
    else if (d.category === 'Others') others++;
  });

  // 5. On Parade = Present in the Unit - Off Parade
  const onParade = Math.max(0, presentInUnit - offParade);

  const onParadePercentage =
    presentInUnit > 0 ? Math.round((onParade / presentInUnit) * 100) : 0;
  const presentInUnitPercentage =
    totalPosted > 0 ? Math.round((presentInUnit / totalPosted) * 100) : 0;

  return {
    battery: batteryScope,
    totalPosted,
    outOfUnit,
    presentInUnit,
    offParade,
    onParade,
    onParadePercentage,
    presentInUnitPercentage,
    outOfUnitBreakdown: {
      leave,
      course,
      sick,
      tempDuty,
      attachedOut,
      awol,
    },
    dutyBreakdown: {
      unitSy,
      working,
      fixedDuty,
      others,
    },
  };
}

/**
 * Normalizes duty names so that equivalent designations (e.g. Regt Guard and Quarter Guard)
 * map to a single unified standard heading.
 */
export function normalizeDutyName(name: string): string {
  if (!name) return 'General';
  const trimmed = name.trim();
  const lower = trimmed.toLowerCase();

  // Quarter Guard / Regt Guard variations (in artillery units Regt Guard is stationed at Quarter Guard)
  if (
    lower === 'regt guard' ||
    lower === 'regt. guard' ||
    lower === 'regimental guard' ||
    lower === 'regt gd' ||
    lower === 'quarter guard' ||
    lower === 'quarter gd' ||
    lower === 'qtr guard' ||
    lower === 'qtr. guard' ||
    lower === 'qtr gd' ||
    lower === 'q guard' ||
    lower === 'q-guard' ||
    lower === 'qguard' ||
    lower.includes('quarter guard') ||
    lower.includes('qtr guard') ||
    lower.includes('regt guard') ||
    lower.includes('regimental guard')
  ) {
    return 'Quarter Guard';
  }

  // Kot Guard / Kote Guard
  if (
    lower === 'kot guard' ||
    lower === 'kote guard' ||
    lower === 'kot' ||
    lower === 'kote' ||
    lower === 'kote gd'
  ) {
    return 'Kot Guard';
  }

  // Main Gate Guard
  if (lower === 'main gate' || lower === 'main gate guard' || lower === 'main gate gd') {
    return 'Main Gate Guard';
  }

  // Magazine Guard
  if (lower === 'magazine' || lower === 'magazine guard' || lower === 'mag guard') {
    return 'Magazine Guard';
  }

  // RP Duty
  if (lower === 'rp' || lower === 'rp duty' || lower === 'regimental police') {
    return 'RP Duty';
  }

  return trimmed;
}
