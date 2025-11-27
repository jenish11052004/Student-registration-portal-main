export interface Domain {
    id: number;
    program: string;
    qualification: string;
}

export interface Student {
    id?: number;
    firstName: string;
    lastName: string;
    email: string;
    cgpa: string | number;
    totalCredits: string | number;
    graduationYear: string | number;
    domainId: string | number;
    specialisationId?: string | number | null;
    placementId?: string | number | null;
    rollNumber?: string;
    photographPath?: string;
    domainProgram?: string;
}
