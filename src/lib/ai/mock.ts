import type { GenerationType } from "@/types/database";

const MOCK_DELAY_MS = 1500;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_RESPONSES: Record<GenerationType, unknown> = {
  problem_template: {
    template_type: "analytics_dashboard",
    problem_statement:
      "Build a customer retention analytics dashboard that visualizes churn risk signals, identifies at-risk segments, and recommends targeted retention campaigns — demonstrating the analytical thinking and data-driven decision making this role requires.",
    solution_summary:
      "A real-time dashboard that ingests customer behavior data, applies predictive models to score churn risk, and presents actionable insights through interactive visualizations. Features include cohort analysis, funnel breakdowns, and automated alert thresholds.",
    assumptions_md:
      "- The company has access to historical customer interaction data\n- Key churn signals include login frequency, feature usage, and support ticket volume\n- The dashboard targets product managers and customer success teams\n- Data refresh cadence is daily",
    reasoning:
      "Given the role focuses on data analysis and customer insights, an analytics dashboard best showcases the candidate's ability to transform raw data into strategic recommendations.",
  },

  recruiter_summary: {
    content:
      "## Candidate Overview\n\nA driven early-career professional combining strong analytical skills with hands-on project experience. Demonstrates initiative through self-directed projects and a track record of translating complex data into actionable insights. Well-suited for a role that demands both technical rigor and creative problem-solving.\n\n### Key Strengths\n- **Data Analysis**: Experience building dashboards and data pipelines\n- **Product Thinking**: Proven ability to identify user needs and design solutions\n- **Communication**: Strong written and verbal skills demonstrated through presentations and documentation",
  },

  why_this_company: {
    content:
      "## Why This Company\n\nThis company's mission to democratize access to data-driven decision making resonates deeply with my academic focus on making complex systems understandable. During my coursework in data visualization, I was inspired by how the company's platform turns raw metrics into stories that drive action.\n\nThe team's engineering blog posts on scalable analytics architecture show a commitment to technical excellence that I want to learn from and contribute to. I'm particularly excited about the opportunity to work on customer-facing analytics features that directly impact how businesses understand their users.",
  },

  evidence_summary: {
    content:
      "## Relevant Experience & Evidence\n\n### Technical Projects\n- **Customer Analytics Pipeline**: Built an end-to-end data pipeline processing 100K+ daily events, demonstrating ability to work with production-scale data systems\n- **Interactive Dashboard Prototype**: Designed and implemented a React-based dashboard with real-time filtering and drill-down capabilities\n\n### Academic & Leadership\n- Led a team of 4 in a capstone project focused on predictive modeling for user engagement\n- Published analysis of A/B testing methodologies in the university research journal\n\n### Skills Demonstrated\nSQL, Python, React, D3.js, statistical analysis, user research, technical writing",
  },

  mini_prd: {
    content:
      '## Mini PRD: Customer Retention Analytics Dashboard\n\n### Problem\nProduct teams lack a centralized view of customer health signals, making it difficult to proactively identify and address churn risk before customers leave.\n\n### Solution\nAn interactive analytics dashboard that aggregates customer behavior data, applies churn prediction scoring, and surfaces actionable retention recommendations.\n\n### User Stories\n1. As a product manager, I want to see an overview of customer health metrics so I can prioritize retention efforts\n2. As a customer success manager, I want to drill into individual account risk scores so I can plan personalized outreach\n3. As a data analyst, I want to filter and segment customer data so I can identify trends across cohorts\n\n### Key Features\n- **Health Score Overview**: Summary cards showing total customers, at-risk count, churn rate, and NPS\n- **Risk Segmentation Chart**: Visual breakdown of customers by risk tier (low/medium/high/critical)\n- **Trend Analysis**: Time-series chart showing churn rate and health score trends over 12 months\n- **Customer Table**: Sortable, filterable list with health score, last activity, plan type, and recommended action\n\n### Technical Approach\n- React with TypeScript for the frontend\n- Chart.js or Recharts for data visualization\n- Mock data layer simulating real API responses\n- Responsive design for desktop and tablet\n\n### Success Metrics\n- Dashboard loads within 2 seconds\n- All interactive elements (filters, sorting, drill-down) respond within 200ms\n- Demonstrates understanding of key analytics concepts relevant to the role',
  },

  mini_todo: {
    json: [
      {
        id: 1,
        task: "Set up project scaffold with Next.js + TypeScript",
        status: "todo",
        priority: "high",
        estimatedHours: 1,
      },
      {
        id: 2,
        task: "Create mock data layer with realistic customer metrics",
        status: "todo",
        priority: "high",
        estimatedHours: 2,
      },
      {
        id: 3,
        task: "Build health score overview cards component",
        status: "todo",
        priority: "high",
        estimatedHours: 2,
      },
      {
        id: 4,
        task: "Implement risk segmentation donut/bar chart",
        status: "todo",
        priority: "medium",
        estimatedHours: 3,
      },
      {
        id: 5,
        task: "Build trend analysis time-series chart",
        status: "todo",
        priority: "medium",
        estimatedHours: 3,
      },
      {
        id: 6,
        task: "Create filterable customer data table",
        status: "todo",
        priority: "medium",
        estimatedHours: 3,
      },
      {
        id: 7,
        task: "Add interactive filters and drill-down navigation",
        status: "todo",
        priority: "medium",
        estimatedHours: 2,
      },
      {
        id: 8,
        task: "Polish styling, responsive design, and loading states",
        status: "todo",
        priority: "low",
        estimatedHours: 2,
      },
    ],
    markdown:
      "## Implementation Todo List\n\n### High Priority\n- [ ] Set up project scaffold with Next.js + TypeScript (1h)\n- [ ] Create mock data layer with realistic customer metrics (2h)\n- [ ] Build health score overview cards component (2h)\n\n### Medium Priority\n- [ ] Implement risk segmentation donut/bar chart (3h)\n- [ ] Build trend analysis time-series chart (3h)\n- [ ] Create filterable customer data table (3h)\n- [ ] Add interactive filters and drill-down navigation (2h)\n\n### Low Priority\n- [ ] Polish styling, responsive design, and loading states (2h)\n\n**Total Estimated: ~18 hours**",
  },

  two_week_plan: {
    content:
      "## Two-Week Implementation Plan\n\n### Week 1: Foundation & Core Components\n\n**Day 1-2: Project Setup & Data Layer**\n- Initialize Next.js project with TypeScript and Tailwind\n- Design mock data schema for customer metrics\n- Build data generation utilities for realistic test data\n- Set up component library and design tokens\n\n**Day 3-4: Overview Dashboard**\n- Build health score KPI cards (total customers, at-risk, churn rate, NPS)\n- Implement risk segmentation chart (donut or stacked bar)\n- Create responsive grid layout for dashboard\n\n**Day 5: Trend Analysis**\n- Build time-series chart component for churn trends\n- Add date range selector and comparison overlays\n- Implement tooltip and hover interactions\n\n### Week 2: Advanced Features & Polish\n\n**Day 6-7: Customer Table**\n- Build sortable, paginated customer data table\n- Add search and filter functionality (plan type, risk tier, date range)\n- Implement row expansion for detailed customer view\n\n**Day 8-9: Interactivity & Navigation**\n- Connect chart click events to table filters (drill-down)\n- Add global filter bar syncing across all visualizations\n- Build mini detail panel for individual customer profiles\n\n**Day 10: Polish & Documentation**\n- Responsive testing and layout adjustments\n- Loading states, error boundaries, empty states\n- Write README with setup instructions and architecture overview\n- Record a 2-minute demo walkthrough\n\n### Milestones\n- **End of Day 2**: Data layer complete, first component rendering\n- **End of Day 5**: Core dashboard with 3 visualization types\n- **End of Day 9**: Full interactive experience\n- **End of Day 10**: Production-ready demo with documentation",
  },

  mini_app_config: {
    config: {
      template: "analytics_dashboard",
      title: "Customer Retention Analytics",
      description: "Real-time customer health monitoring and churn prediction",
      sections: [
        {
          id: "overview",
          type: "kpi_cards",
          title: "Health Overview",
          metrics: [
            {
              label: "Total Customers",
              value: 12847,
              trend: "+3.2%",
              trendDirection: "up",
            },
            {
              label: "At-Risk",
              value: 423,
              trend: "-12%",
              trendDirection: "down",
            },
            {
              label: "Churn Rate",
              value: "4.2%",
              trend: "-0.8%",
              trendDirection: "down",
            },
            {
              label: "Avg Health Score",
              value: 73,
              trend: "+2",
              trendDirection: "up",
            },
          ],
        },
        {
          id: "risk_chart",
          type: "donut_chart",
          title: "Risk Segmentation",
          data: [
            { label: "Low Risk", value: 8420, color: "#22c55e" },
            { label: "Medium Risk", value: 2847, color: "#f59e0b" },
            { label: "High Risk", value: 1157, color: "#ef4444" },
            { label: "Critical", value: 423, color: "#7c3aed" },
          ],
        },
        {
          id: "trend",
          type: "line_chart",
          title: "Churn Rate Trend",
          xAxis: "Month",
          yAxis: "Churn Rate (%)",
          data: [
            { x: "Jan", y: 5.1 },
            { x: "Feb", y: 4.8 },
            { x: "Mar", y: 5.0 },
            { x: "Apr", y: 4.6 },
            { x: "May", y: 4.3 },
            { x: "Jun", y: 4.2 },
          ],
        },
      ],
      filters: [
        {
          id: "plan",
          label: "Plan Type",
          options: ["All", "Free", "Starter", "Pro", "Enterprise"],
        },
        {
          id: "risk",
          label: "Risk Tier",
          options: ["All", "Low", "Medium", "High", "Critical"],
        },
        {
          id: "period",
          label: "Time Period",
          options: ["7d", "30d", "90d", "12m"],
        },
      ],
    },
  },
};

export async function getMockResponse(
  generationType: GenerationType
): Promise<unknown> {
  await delay(MOCK_DELAY_MS);
  const response = MOCK_RESPONSES[generationType];
  if (!response) {
    throw new Error(`No mock response for generation type: ${generationType}`);
  }
  return response;
}
