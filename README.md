# Stash 💰

**Your savings, earning more.**

A modern consumer savings app that helps you grow your money through smart savings accounts and goal tracking. Built with cutting-edge financial technology to give you better returns on your savings.

![Stash App Screenshot](https://via.placeholder.com/800x400/4F46E5/FFFFFF?text=Stash+App+Screenshot)

## Features

### 💳 Smart Savings Accounts
- Create multiple savings accounts for different purposes
- Automatic earning on all deposits
- Real-time balance tracking
- Detailed transaction history

### 🎯 Savings Goals
- Set personalized savings targets
- Track progress with visual indicators
- Milestone celebrations and achievements
- Goal-based budgeting tools

### 📈 Earnings Tracking
- Live earnings dashboard
- Historical yield performance
- Compound growth visualization
- Monthly and yearly earnings reports

### 💰 Easy Deposits & Withdrawals
- Instant deposits from your bank account
- Quick withdrawal to your wallet
- No hidden fees or minimum balances
- Secure and reliable transactions

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Charts**: Recharts for data visualization
- **Web3**: Wagmi, Viem for blockchain integration
- **UI Components**: Custom component library
- **State Management**: React Context and Hooks

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/san-npm/stash.git
cd stash
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Built with YO SDK

Stash is powered by the YO Protocol SDK, bringing institutional-grade financial infrastructure to consumer savings:

### Core Integration
- **@yo-protocol/core**: Powers all financial operations including deposits, withdrawals, and yield calculations
- **@yo-protocol/react**: Provides React hooks and components for seamless blockchain integration

### Key SDK Features Used

#### 🏦 Vault Management
- Real-time vault data synchronization
- Automated yield distribution
- Multi-asset support and portfolio management

#### 📊 Balance Tracking
- Live balance updates across all accounts
- Historical balance charting
- Earnings calculation and attribution

#### 💸 Transaction Handling
- Secure deposit and withdrawal flows
- Transaction status tracking and confirmations
- Gas optimization and fee estimation

#### 📈 Historical Yields
- Performance tracking over time
- Yield comparison across different savings strategies
- Compound interest calculations

Every feature in Stash leverages the YO SDK to ensure:
- **Security**: Bank-level security through decentralized protocols
- **Transparency**: All transactions are verifiable and auditable
- **Performance**: Optimized yield strategies powered by DeFi
- **Reliability**: Battle-tested infrastructure handling millions in assets

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Project Structure

```
stash/
├── app/                 # Next.js app router pages
│   ├── accounts/       # Savings accounts management
│   ├── deposit/        # Deposit flow
│   ├── goals/          # Savings goals
│   ├── onboard/        # User onboarding
│   └── withdraw/       # Withdrawal flow
├── components/         # Reusable UI components
├── lib/               # Utilities and configurations
└── public/            # Static assets
```

## Hackathon Submission

This project was built for the [YO Protocol Hackathon](https://dorahacks.io/hackathon/yo-protocol) - showcasing how decentralized finance can be made accessible and user-friendly for everyday consumers.

**Submission Highlights:**
- Consumer-first design focusing on ease of use
- Complete savings app with multiple use cases
- Full integration with YO Protocol SDK
- Production-ready UI and user experience
- Mobile-responsive design

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with ❤️ for the YO Protocol Hackathon