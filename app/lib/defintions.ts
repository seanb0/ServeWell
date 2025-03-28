export type Church = {
    church_id: number;
    churchname: string;
    churchphone: string;
    email: string;
    streetaddress: string;
    postalcode: string;
    city: string;
    denomination: string;
};

export type ChurchMember = {
    id: number;
    FirstName: string;
    MiddleName: string;
    LastName: string;
    Sex: 'M' | 'F';
    email: string;
    phone: string;
    activity_status: 'active' | 'inactive';
    church_id: number;
    church_join_date: string;
}

export interface Ministry {
    ministry_id: number;
    ministryname: string;
    church_id: number;
    budget: number;
    description: string | null;
}

export type SpreadsheetData = {
    id: number;
    superadmin_id: number;
    file_name: string;
    data: Buffer;
    uploaded_at: string;
};

