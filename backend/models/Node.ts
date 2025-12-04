export interface Node{
    id:string,

    ip:string,
    trustScore:number

    status: 'pending' | 'active' | 'blocked';
    stage: 'Verification' | 'Scoring' | 'Active Session' | 'Blocked';
}

