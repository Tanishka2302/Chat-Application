echo "Installing backend..."
cd backend
npm install
npx prisma generate

echo "Installing frontend..."
cd ../frontend
npm install
npm run build
