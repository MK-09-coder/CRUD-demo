const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 8080;
const dataFilePath = path.join(__dirname, 'data.json');

let employees = [];
let employeeId = 1;

// Load data from the data.json file
function loadData() {
  try {
    const data = fs.readFileSync(dataFilePath, 'utf8');
    employees = JSON.parse(data);
  } catch (error) {
    employees = [];
  }
}

// Save data to the data.json file
function saveData() {
  const activeEmployees = employees.filter((emp) => emp.isActive);
  const data = JSON.stringify(activeEmployees, null, 2);
  fs.writeFileSync(dataFilePath, data, 'utf8');
}

// Load initial data from the data.json file
loadData();

// Greeting given
app.get('/greeting', (req, res) => {
  return res.send('Hello world!');
});

// Register Employee
app.post('/employee', (req, res) => {
  const { name, city } = req.body;
  const newEmployee = {
    employeeId: employeeId.toString(),
    name,
    city,
    isActive: true, // Add isActive flag and set it to true by default
  };
  employeeId++;
  employees.push(newEmployee);

  // Save data to the data.json file
  saveData();

  res.status(201).json({ employeeId: newEmployee.employeeId });
});

// Get Employee details (excluding isActive flag)
app.get('/employee/:id', (req, res) => {
  const employeeId = req.params.id;
  const employee = employees.find((emp) => emp.employeeId === employeeId && emp.isActive);

  if (!employee) {
    return res.status(404).json({ message: `Employee with ${employeeId} was not found` });
  }

  // Exclude the isActive property from the response
  const { isActive, ...employeeWithoutIsActive } = employee;
  res.status(200).json(employeeWithoutIsActive);
});

// Get all Employee details (excluding deleted employees and excluding isActive flag)
app.get('/employees/all', (req, res) => {
  const activeEmployees = employees.filter((emp) => emp.isActive);
  const employeesWithoutIsActive = activeEmployees.map(({ isActive, ...employee }) => employee);
  res.status(200).json(employeesWithoutIsActive);
});

// Update Employee (excluding isActive flag)
app.put('/employee/:id', (req, res) => {
  const employeeId = req.params.id;
  const { name, city } = req.body;
  const employeeIndex = employees.findIndex((emp) => emp.employeeId === employeeId && emp.isActive);

  if (employeeIndex === -1) {
    return res.status(404).json({ message: `Employee with ${employeeId} was not found` });
  }
  employees[employeeIndex].name = name;
  employees[employeeIndex].city = city;

  // Save data to the data.json file
  saveData();

  // Exclude the isActive property from the response
  const { isActive, ...updatedEmployee } = employees[employeeIndex];
  res.status(201).json(updatedEmployee);
});

// Delete Employee (excluding isActive flag)
app.delete('/employee/:id', (req, res) => {
  const employeeId = req.params.id;
  const employeeIndex = employees.findIndex((emp) => emp.employeeId === employeeId && emp.isActive);

  if (employeeIndex === -1) {
    return res.status(404).json({ message: `Employee with ${employeeId} was not found` });
  }
  employees[employeeIndex].isActive = false; // Set isActive flag to false instead of removing the employee

  // Save data to the data.json file
  saveData();

  // Exclude the isActive property from the response
  const { isActive, ...deletedEmployee } = employees[employeeIndex];
  res.status(200).json(deletedEmployee);
});

app.listen(PORT, () => {
  console.log("Server running at PORT", PORT);
});