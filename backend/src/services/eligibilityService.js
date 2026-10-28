/**
 * Opplyra Eligibility Analysis Service
 * 
 * Compares student profile attributes with opportunity eligibility requirements.
 * Returns structured classification: MATCHED, UNMATCHED, or UNKNOWN.
 * Strictly assistive — never claims eligibility is guaranteed.
 */

function evaluateEligibility(profile, opportunity) {
  if (!opportunity) {
    return {
      overallStatus: 'UNKNOWN',
      criteriaEvaluations: [],
      disclaimer: 'No opportunity criteria provided.'
    };
  }

  const criteria = opportunity.eligibilityCriteria || {};
  const evaluations = [];

  // 1. Course / Degree Requirement
  if (criteria.coursesAllowed && criteria.coursesAllowed.length > 0) {
    if (!profile || !profile.course) {
      evaluations.push({
        field: 'Course / Degree',
        statedRequirement: criteria.coursesAllowed.join(', '),
        studentValue: 'Not set in profile',
        status: 'UNKNOWN',
        explanation: 'Add your degree program to your profile so we can check if it matches.'
      });
    } else {
      const studentCourse = profile.course.toLowerCase();
      const isAllowed = criteria.coursesAllowed.some(c => {
        const lowerC = c.toLowerCase();
        return (
          lowerC === 'all ug' ||
          lowerC === 'graduates' ||
          studentCourse.includes(lowerC) ||
          lowerC.includes(studentCourse) ||
          (studentCourse.includes('computer') && lowerC.includes('cs')) ||
          (studentCourse.includes('tech') && lowerC.includes('tech')) ||
          (studentCourse.includes('engineering') && lowerC.includes('engineering'))
        );
      });

      evaluations.push({
        field: 'Course / Degree',
        statedRequirement: criteria.coursesAllowed.join(', '),
        studentValue: profile.course,
        status: isAllowed ? 'MATCHED' : 'UNMATCHED',
        explanation: isAllowed
          ? `Your course "${profile.course}" matches the accepted degrees.`
          : `This opportunity looks for [${criteria.coursesAllowed.join(', ')}], which does not appear to match your course "${profile.course}".`
      });
    }
  }

  // 2. Academic Year / Cohort
  if (criteria.academicYearsAllowed && criteria.academicYearsAllowed.length > 0) {
    if (!profile || !profile.academicYear) {
      evaluations.push({
        field: 'Academic Year',
        statedRequirement: criteria.academicYearsAllowed.join(', '),
        studentValue: 'Not set in profile',
        status: 'UNKNOWN',
        explanation: 'Add your current year of study to check if applications are open for your batch.'
      });
    } else {
      const isYearAllowed = criteria.academicYearsAllowed.some(y => 
        y.toLowerCase().trim() === profile.academicYear.toLowerCase().trim()
      );

      evaluations.push({
        field: 'Academic Year',
        statedRequirement: criteria.academicYearsAllowed.join(', '),
        studentValue: profile.academicYear,
        status: isYearAllowed ? 'MATCHED' : 'UNMATCHED',
        explanation: isYearAllowed
          ? `Your current year of study (${profile.academicYear}) matches what this opportunity asks for.`
          : `This opportunity is for [${criteria.academicYearsAllowed.join(', ')}]. You are listed as ${profile.academicYear}.`
      });
    }
  }

  // 3. Minimum CGPA / Percentage
  if (criteria.minimumCgpa !== null && criteria.minimumCgpa !== undefined && criteria.minimumCgpa > 0) {
    if (!profile || profile.cgpa === null || profile.cgpa === undefined) {
      evaluations.push({
        field: 'Minimum CGPA / Percentage',
        statedRequirement: `>= ${criteria.minimumCgpa} CGPA (or equivalent)`,
        studentValue: 'Not set in profile',
        status: 'UNKNOWN',
        explanation: 'Add your CGPA to check if you meet the minimum academic cutoff.'
      });
    } else {
      const satisfies = Number(profile.cgpa) >= Number(criteria.minimumCgpa);
      evaluations.push({
        field: 'Minimum CGPA / Percentage',
        statedRequirement: `>= ${criteria.minimumCgpa} CGPA`,
        studentValue: `${profile.cgpa} CGPA`,
        status: satisfies ? 'MATCHED' : 'UNMATCHED',
        explanation: satisfies
          ? `Your CGPA of ${profile.cgpa} meets or exceeds the required ${criteria.minimumCgpa}.`
          : `Your CGPA (${profile.cgpa}) is lower than the required ${criteria.minimumCgpa}.`
      });
    }
  }

  // 4. Location / State
  if (criteria.locationsAllowed && criteria.locationsAllowed.length > 0) {
    if (!profile || !profile.location) {
      evaluations.push({
        field: 'Location Eligibility',
        statedRequirement: criteria.locationsAllowed.join(', '),
        studentValue: 'Not set in profile',
        status: 'UNKNOWN',
        explanation: 'Add your state or campus location to check for regional requirements.'
      });
    } else {
      const isPanIndia = criteria.locationsAllowed.some(l => l.toLowerCase().includes('pan-india'));
      const studentLoc = profile.location.toLowerCase();
      const locMatch = isPanIndia || criteria.locationsAllowed.some(l => studentLoc.includes(l.toLowerCase()) || l.toLowerCase().includes(studentLoc));

      evaluations.push({
        field: 'Location Eligibility',
        statedRequirement: criteria.locationsAllowed.join(', '),
        studentValue: profile.location,
        status: locMatch ? 'MATCHED' : 'UNKNOWN',
        explanation: locMatch
          ? isPanIndia ? 'Open to eligible students across India.' : `Your location (${profile.location}) matches the stated region.`
          : `This opportunity specifies [${criteria.locationsAllowed.join(', ')}]. Double-check official location rules.`
      });
    }
  }

  // 5. Gender Specific Requirements
  if (criteria.genderPreference && criteria.genderPreference !== 'All') {
    if (!profile || !profile.gender) {
      evaluations.push({
        field: 'Gender Focus',
        statedRequirement: criteria.genderPreference,
        studentValue: 'Not set in profile',
        status: 'UNKNOWN',
        explanation: `This program has a designated focus on ${criteria.genderPreference} candidates.`
      });
    } else {
      const genderMatch = profile.gender.toLowerCase() === criteria.genderPreference.toLowerCase();
      evaluations.push({
        field: 'Gender Focus',
        statedRequirement: criteria.genderPreference,
        studentValue: profile.gender,
        status: genderMatch ? 'MATCHED' : 'UNMATCHED',
        explanation: genderMatch
          ? `Matches the program focus for ${criteria.genderPreference} candidates.`
          : `This program is designated for ${criteria.genderPreference} applicants.`
      });
    }
  }

  // 6. Income Ceiling / Specific Documents
  if (criteria.incomeCeiling && criteria.incomeCeiling !== 'None') {
    evaluations.push({
      field: 'Family Income Limit',
      statedRequirement: criteria.incomeCeiling,
      studentValue: 'Requires Income Certificate',
      status: 'UNKNOWN',
      explanation: 'You will need an official income certificate from your local revenue authority when submitting documents.'
    });
  }

  // Compute summary status
  const hasUnmatched = evaluations.some(e => e.status === 'UNMATCHED');
  const hasUnknown = evaluations.some(e => e.status === 'UNKNOWN');

  let overallStatus = 'APPEARS_ELIGIBLE';
  let overallMessage = 'Based on your saved profile, you seem to meet the listed requirements.';

  if (hasUnmatched) {
    overallStatus = 'CRITERIA_MISMATCH';
    overallMessage = 'Some requirements don\'t match your current profile details.';
  } else if (hasUnknown) {
    overallStatus = 'VERIFICATION_NEEDED';
    overallMessage = 'Some requirements couldn\'t be checked automatically. Please review the official guidelines.';
  }

  return {
    overallStatus,
    overallMessage,
    evaluations,
    disclaimer: 'This check is an assistive guide based on public announcement details. Official selection is decided exclusively by the organization.'
  };
}

module.exports = {
  evaluateEligibility,
};
