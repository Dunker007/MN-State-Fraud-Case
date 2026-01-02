
export type NodeStatus = 'ACTIVE' | 'VACANT' | 'OVERWHELMED' | 'ILLUSION' | 'STANDARD';

export interface OrgNode {
    id: string;
    title: string;
    person?: string;
    status: NodeStatus;
    notes?: string;
    children?: OrgNode[];
    layout?: 'horizontal' | 'vertical' | 'grid';
    yOffset?: number;
}

// Data Structure aligned with May 2025 Screenshot (Pages 1 & 2)
export const orgData: OrgNode = {
    id: 'root',
    title: 'Deputy Inspector General',
    person: 'Dawn Davis',
    status: 'ACTIVE',
    notes: "The Survivor. Architect of 'Systems Issue' narrative. 85% processing metric focus.",
    children: [
        // PAGE 1: MEGAN THOMPSON WING
        {
            id: 'asst_deputy_megan',
            title: 'Asst Deputy Inspector General',
            person: 'Megan Thompson',
            status: 'ACTIVE',
            children: [
                {
                    id: 'enterprise_services',
                    title: 'Enterprise Services & Impact',
                    person: 'Jennifer Sirek (Area Mgr)',
                    status: 'ACTIVE',
                    children: [
                        {
                            id: 'strat_advancement',
                            title: 'Strategic Advancement',
                            person: 'Chuck Jaeger (Sup)',
                            status: 'STANDARD',
                            children: [
                                {
                                    id: 'pmo_office',
                                    title: 'Project Mgmt Office',
                                    person: 'Hannah Ragenscheid (Lead)',
                                    status: 'VACANT',
                                    notes: 'Project Mgmt Office Hollowed Out',
                                    children: [
                                        { id: 'pm_vacant', title: 'Project Managers', person: '3x VACANT', status: 'VACANT' }
                                    ]
                                },
                                { id: 'comms', title: 'Communications', person: 'Kelly MacGregor (WOC)', status: 'STANDARD' },
                                { id: 'ext_rel', title: 'External Relations', person: 'Andrew Johnson', status: 'STANDARD' }
                            ]
                        },
                        {
                            id: 'ent_services',
                            title: 'Enterprise Services',
                            person: 'Kelly MacGregor (Sup)',
                            status: 'STANDARD',
                            children: [
                                { id: 'ent_ba', title: 'Ent. Business Analyst', person: 'Krystle Wallace', status: 'STANDARD' },
                                { id: 'tech_writer', title: 'Technical Writer', status: 'VACANT' },
                                {
                                    id: 'payment',
                                    title: 'Payment Processing Ctr',
                                    status: 'OVERWHELMED',
                                    children: [
                                        { id: 'pay_lead', title: 'Lead', person: 'Taylor Dejvongsa', status: 'ACTIVE' },
                                        { id: 'pay_vacant', title: 'Processor', status: 'VACANT' }
                                    ]
                                },
                                { id: 'contract_analyst', title: 'Contract Service Analyst', person: 'James Beaumaster', status: 'STANDARD' },
                                { id: 'internal_support', title: 'Internal Support', person: 'Frankie Smith', status: 'STANDARD' }
                            ]
                        }
                    ]
                },
                {
                    id: 'training',
                    title: 'Training & Development',
                    person: 'Julie Lange (Sup)',
                    status: 'STANDARD',
                    children: [
                        { id: 'curator', title: 'e-Learning Curator', person: 'Brandon Talbot', status: 'STANDARD' },
                        {
                            id: 'trainers_group',
                            title: 'Instructional Trainers',
                            person: 'Tim Henderson, Jana Wojcik',
                            status: 'STANDARD'
                        },
                        { id: 'train_spec', title: 'Training Specialist', person: 'Angie Spence', status: 'STANDARD' }
                    ]
                },
                {
                    id: 'compliance_quality',
                    title: 'Compliance & Quality Mgmt',
                    person: 'Kate Bigg (Area Mgr)',
                    status: 'OVERWHELMED',
                    notes: 'Critical Failure Point. No support staff.',
                    children: [
                        {
                            id: 'quality_mgmt',
                            title: 'Quality Mgmt',
                            person: 'Hope Spooner (Sup)',
                            status: 'STANDARD',
                            children: [
                                { id: 'cqi', title: 'Continuous Quality Improvement', person: 'Thomas Goodwin', status: 'STANDARD' },
                                { id: 'qa', title: 'Quality Assurance', person: 'Melissa Latourelle', status: 'STANDARD' },
                                { id: 'qc', title: 'Quality Control', person: 'Steve Bahl', status: 'STANDARD' },
                                {
                                    id: 'qual_spec_group',
                                    title: 'Quality Specialists',
                                    person: 'Briana Mellenbruch, Miranda Spry',
                                    status: 'STANDARD'
                                }
                            ]
                        },
                        {
                            id: 'compliance_mgmt',
                            title: 'Compliance Mgmt',
                            status: 'VACANT',
                            notes: 'Supervisor Vacant',
                            children: [
                                { id: 'reg_comp', title: 'Regulatory Compliance', status: 'VACANT' },
                                { id: 'cres_risk', title: 'CJIS/Risk Mgmt', person: 'Jackie Stemwedel', status: 'STANDARD' },
                                { id: 'comp_spec', title: 'Compliance Specialist', status: 'VACANT' }
                            ]
                        }
                    ]
                }
            ]
        },
        // PAGE 2: JOSH QUIGLEY WING
        {
            id: 'asst_deputy_josh',
            title: 'Asst Deputy Inspector General',
            person: 'Josh Quigley',
            status: 'ACTIVE',
            children: [
                {
                    id: 'ent_systems',
                    title: 'Systems & Vendor Mgmt',
                    person: 'Michelle Hassler (Area Mgr)',
                    status: 'STANDARD',
                    children: [
                        {
                            id: 'ns2_help',
                            title: 'NS2 Help Desk',
                            person: 'Nicole Tillma (Sup)',
                            status: 'STANDARD',
                            children: [
                                { id: 'help_lead', title: 'Lead', person: 'Melissa Brookins', status: 'STANDARD' },
                                {
                                    id: 'help_desk_group',
                                    title: 'Help Desk Team',
                                    person: 'M. Kohlberg, A. Stroebel',
                                    status: 'STANDARD'
                                },
                                { id: 'help_vacant', title: 'Help Desk', status: 'VACANT' }
                            ]
                        },
                        {
                            id: 'ns2_dev',
                            title: 'NS2 Development',
                            person: 'Shauna Feine (Sup)',
                            status: 'STANDARD',
                            children: [
                                { id: 'dev_lead', title: 'Lead', person: 'Peter Haroldson', status: 'STANDARD' },
                                {
                                    id: 'dev_team',
                                    title: 'Developers',
                                    person: 'Ryan Kielbasa, Eric Welin',
                                    status: 'STANDARD'
                                },
                                { id: 'dev_vacant', title: 'Developers', person: '2x VACANT', status: 'VACANT' }
                            ]
                        },
                        { id: 'sys_proj_lead', title: 'Systems Project Lead', person: 'Kari Miller', status: 'STANDARD' },
                        { id: 'sys_impl', title: 'Systems Implementation', person: 'Yani Byrd', status: 'STANDARD' },
                        { id: 'vendor_mgmt', title: 'Vendor Mgmt', person: 'Jess Tomaselli', status: 'STANDARD' }
                    ]
                },
                {
                    id: 'research_ops',
                    title: 'Research & Operations',
                    person: 'Jana Nicolaison (Area Mgr)',
                    status: 'ILLUSION',
                    notes: 'High Volume Processing Factory',
                    layout: 'grid',
                    yOffset: 120,
                    children: [
                        {
                            id: 'inv_leads',
                            title: 'Inv. Researcher Leads',
                            person: 'S. Sarumi, L. Dreifke, J. Henthorne, J. Hanscom, I. Lee, 1x VACANT',
                            status: 'STANDARD'
                        },
                        {
                            id: 'unit_1',
                            title: 'Research Unit 1',
                            person: 'Elizabeth Turner (Sup)',
                            status: 'ILLUSION',
                            children: [
                                {
                                    id: 'res_asst_1',
                                    title: 'Research Assistants',
                                    person: 'P. Barclay, M. Borgen, R. Paloma',
                                    status: 'STANDARD'
                                },
                                {
                                    id: 'inv_res_1',
                                    title: 'Inv. Researchers',
                                    person: 'C. Aldean, K. Anderson, L. Duff, L. Enstad, J. Fossum, K. Fredin, C. Heilman',
                                    status: 'STANDARD'
                                }
                            ]
                        },
                        {
                            id: 'unit_2',
                            title: 'Research Unit 2',
                            person: 'Lori Steffen (Sup)',
                            status: 'ILLUSION',
                            children: [
                                {
                                    id: 'res_asst_2',
                                    title: 'Research Assistants',
                                    person: 'T. Boyd, K. Ekdahl, M. Resemius-Grant',
                                    status: 'STANDARD'
                                },
                                {
                                    id: 'inv_res_2',
                                    title: 'Inv. Researchers',
                                    person: 'K. Boone, C. Greene, T. Jacobson, K. Lee, A. Mata, J. Stadheim, S. Wilson',
                                    status: 'STANDARD'
                                }
                            ]
                        },
                        {
                            id: 'unit_3',
                            title: 'Research Unit 3',
                            person: 'Charissa Jones (Sup)',
                            status: 'ILLUSION',
                            children: [
                                {
                                    id: 'res_asst_3',
                                    title: 'Research Assistants',
                                    person: 'M. Brown, K. Sailor, I. Sarumi',
                                    status: 'STANDARD'
                                },
                                {
                                    id: 'inv_res_3',
                                    title: 'Inv. Researchers',
                                    person: "M. Ahmed, K. Hamlin, E. Liggett, C. Nelson, N. O'Shaughnessy, D. Ryan, K. Thayer, M. Tuominen",
                                    status: 'STANDARD'
                                },
                                { id: 'inv_res_3_vacant', title: 'Inv. Researcher', status: 'VACANT' }
                            ]
                        },
                        {
                            id: 'unit_4',
                            title: 'Research Unit 4',
                            person: 'Chalee Yang (Sup)',
                            status: 'ILLUSION',
                            children: [
                                {
                                    id: 'res_asst_4',
                                    title: 'Research Assistants',
                                    person: 'D. Lerma, N. Selina, J. Yang',
                                    status: 'STANDARD'
                                },
                                {
                                    id: 'inv_res_4',
                                    title: 'Inv. Researchers',
                                    person: 'S. Borbor, M. Bourgeois, D. Fairchild, B. Her, A. Mohamed, L. Reiher',
                                    status: 'STANDARD'
                                },
                                { id: 'inv_res_4_vacant', title: 'Inv. Researcher', status: 'VACANT' }
                            ]
                        }
                    ]
                },
                {
                    id: 'contact_center',
                    title: 'Contact Center & Triage',
                    person: 'Mike Buchanan (Area Mgr)',
                    status: 'STANDARD',
                    children: [
                        { id: 'cc_unit1', title: 'CC/T Unit 1', person: 'Steven DeSpiegelaere (Sup)', status: 'STANDARD' },
                        { id: 'cc_unit2', title: 'CC/T Unit 2', person: 'Jordan Zoet (Sup)', status: 'STANDARD' }
                    ]
                }
            ]
        }
    ]
};
