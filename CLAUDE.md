# CLAUDE.md - AWS Amplify Gen2 Ladder Web Application

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint on all files

## Code Style Guidelines
- **TypeScript**: Use strict mode with explicit types for function params/returns
- **Imports**: Group imports by: 1) React/Next.js, 2) third-party, 3) internal/project
- **Components**: Use functional components with explicit type definitions
- **Chakra UI v3**: Use the latest component patterns with SelectRoot, etc.
- **Naming**:
  - React components: PascalCase (e.g., `LadderManager.tsx`)
  - Hooks: camelCase with `use` prefix (e.g., `useTeams.ts`)
  - Utilities: camelCase (e.g., `amplify-helpers.ts`)
- **Error Handling**: Use try/catch blocks with error logging to console
- **State Management**: Use React hooks like useState, useCallback, useEffect
- **Data Access**: Use Amplify data client methods through custom hooks
- **Formatting**: 2-space indentation, no trailing whitespace
- **File Structure**: Client components go in client.tsx files beside page.tsx
