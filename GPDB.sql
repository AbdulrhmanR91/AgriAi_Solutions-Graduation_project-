
DROP TABLE IF EXISTS Notifications, PlantIssues, Consultations, Orders, Products, Crops, Companies, Experts, Farmers, Users;
drop type UserTypeEnum

CREATE TYPE UserTypeEnum AS ENUM ('Farmer', 'Company', 'Experts');


CREATE TABLE Users (
    User_ID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone_Number VARCHAR(20),
    Password_Hash VARCHAR(255) NOT NULL,
    User_Type UserTypeEnum NOT NULL, 
    Registration_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE Farmers (
    Farmer_ID INT PRIMARY KEY,
    Farm_Name VARCHAR(100) NOT NULL,
    Farm_Location VARCHAR(100),
    Farm_Size DECIMAL(10, 2),
    FOREIGN KEY (Farmer_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);

CREATE TABLE Experts (
    Expert_ID INT PRIMARY KEY,
    Specialization VARCHAR(100),
    Experience_Years INT,
    University VARCHAR(100),
    FOREIGN KEY (Expert_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);


CREATE TABLE Companies (
    Company_ID INT PRIMARY KEY,
    Company_Name VARCHAR(100) NOT NULL,
    Business_Address VARCHAR(200),
    TaxRegistration_Number VARCHAR(50),
    FOREIGN KEY (Company_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);


CREATE TABLE Crops (
    Crop_ID SERIAL PRIMARY KEY,
    Crop_Name VARCHAR(100) NOT NULL,
    Farmer_ID INT,
    Planting_Date DATE,
    Harvest_Date DATE,
    FOREIGN KEY (Farmer_ID) REFERENCES Farmers(Farmer_ID) ON DELETE CASCADE
);


CREATE TABLE Products (
    Product_ID SERIAL PRIMARY KEY,
    Product_Name VARCHAR(100) NOT NULL,
    Product_Type VARCHAR(50),
    Price DECIMAL(10, 2),
    Quantity INT,
    Owner_ID INT, -- Can be FarmerID or CompanyID
    Owner_Type VARCHAR(20), 
    FOREIGN KEY (Owner_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);


CREATE TABLE Orders (
    Order_ID SERIAL PRIMARY KEY,
    Product_ID INT,
    Buyer_ID INT, -- Can be FarmerID or CompanyID
    Buyer_Type VARCHAR(20), 
    Order_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Quantity INT,
    Total_Price DECIMAL(10, 2),
    FOREIGN KEY (Product_ID) REFERENCES Products(Product_ID) ON DELETE CASCADE,
    FOREIGN KEY (Buyer_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);


CREATE TABLE Consultations (
    Consultation_ID SERIAL PRIMARY KEY,
    Expert_ID INT,
    Farmer_ID INT,
    Crop_ID INT,
    Scheduled_Date TIMESTAMP,
    Notes TEXT,
    Status VARCHAR(20), 
    FOREIGN KEY (Expert_ID) REFERENCES Experts(Expert_ID) ON DELETE CASCADE,
    FOREIGN KEY (Farmer_ID) REFERENCES Farmers(Farmer_ID) ON DELETE CASCADE,
    FOREIGN KEY (Crop_ID) REFERENCES Crops(Crop_ID) ON DELETE CASCADE
);


CREATE TABLE Notifications (
    Notification_ID SERIAL PRIMARY KEY,
    User_ID INT,
    Message TEXT,
    Notification_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (User_ID) REFERENCES Users(User_ID) ON DELETE CASCADE
);


CREATE TABLE PlantIssues (
    Issue_ID SERIAL PRIMARY KEY,
    Crop_ID INT,
    Issue_Date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Detected_Disease VARCHAR(100),
    Confidence_Level DECIMAL(5, 2),
    Severity_Level VARCHAR(20), 
    Recommendations TEXT,
    FOREIGN KEY (Crop_ID) REFERENCES Crops(Crop_ID) ON DELETE CASCADE
);


INSERT INTO Users (Name, Email, Phone_Number, Password_Hash, User_Type)
VALUES 
    ('John Doe', 'john@farmers.com', '1234567890', 'hashed_password', 'Farmer'),
    ('Sarah Smith', 'sarah@experts.com', '9876543210', 'hashed_password', 'Experts'),
    ('GreenGrow', 'greengrow@company.com', '5647382910', 'hashed_password', 'Company');

INSERT INTO Farmers (Farmer_ID, Farm_Name, Farm_Location, Farm_Size)
VALUES (1, 'John''s Farm', 'Monufia, Egypt', 20.5);

INSERT INTO Experts (Expert_ID, Specialization, Experience_Years, University)
VALUES (2, 'Crop Disease Specialist', 5, 'Cairo University');

INSERT INTO Companies (Company_ID, Company_Name, Business_Address, TaxRegistration_Number)
VALUES (3, 'GreenGrow', 'Alexandria, Egypt', 'TRN123456');

INSERT INTO Crops (Crop_Name, Farmer_ID, Planting_Date, Harvest_Date)
VALUES ('Tomato', 1, '2024-01-15', '2024-05-15');

INSERT INTO Products (Product_Name, Product_Type, Price, Quantity, Owner_ID, Owner_Type)
VALUES ('Organic Tomatoes', 'Vegetables', 10.00, 500, 1, 'Farmer');

INSERT INTO Orders (Product_ID, Buyer_ID, Buyer_Type, Quantity, Total_Price)
VALUES (1, 3, 'Company', 100, 1000.00);

INSERT INTO PlantIssues (Crop_ID, Detected_Disease, Confidence_Level, Severity_Level, Recommendations)
VALUES (1, 'Early Blight', 92.00, 'Moderate', '1. Apply copper-based fungicide\n2. Improve air circulation\n3. Remove affected leaves');


