-- Name: GROUP-25 Aishwarya Manicka Ravichandran and Amy Robertson
-- Description: Data Manipulation queries for tourism database
----------------------------------------
--------- Queries for Customer ---------
-----------------------------------------
--
-- SELECT query for `customers` display
--
SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, customers.middle_name as middle_name,
       customers.last_name as last_name,customers.street_no as street_no,
       customers.city as city, customers.state as state, customers.country as country,
       customers.postal_code as postal_code, customers.phone_number as phone_number, 
       customers.email_id as email_id, customers.passport_number as passport_number,
       customers.passport_countryofissue as passport_countryofissue
       	FROM customers
		GROUP BY customers.customer_ID
        ORDER BY customers.customer_ID;
--
-- SELECT query for 'email_id' in dropdown
--
SELECT customer_ID, email_id FROM customers ORDER BY customer_ID;
--
-- SELECT query for inserting the available info to update customer
--
SELECT customer_ID as customer_ID,first_name as first_name, 
		last_name as last_name, street_no as street_no, city as city,
        state as state, country as country, postal_code as postal_code,
		phone_number as phone_number,
        email_id as email_id
        FROM customers WHERE customer_ID = :customer_IDInput;
--
-- SELECT query for filtering the customer based on email_id
--
SELECT customers.customer_ID as customer_ID, customers.first_name as first_name, 
		customers.middle_name as middle_name, customers.last_name as last_name,
		customers.street_no as street_no, customers.city as city, 
		customers.state as state, customers.country as country,
		customers.postal_code as postal_code, customers.phone_number as phone_number, 
        customers.email_id as email_id, customers.passport_number as passport_number, 
		customers.passport_countryofissue as passport_countryofissue 
		FROM customers 
        WHERE customers.customer_ID = :customer_IDInput;
--
-- Add new customer
--
INSERT INTO customer (first_name, last_name, middle_name, street_no, city, state, country, postal_code, 
			phone_number, email_id, passport_number, passport_countryofissue, passport_expirydate)
			VALUES (:fnameInput, :lnameInput, :mname_Input, street_Input, country_Input, postal_codeInput,
			phone_numberInput, email_idInput, passport_numberInput, passport_countryofissueInput, passport_expirydateInput);
--
-- Update Customer
--
UPDATE customers
SET first_name = :first_nameInput, last_name = :last_nameInput, street = :streetInput,
	city = :cityInput, state = :stateInput, country = :countryInput, postal_code=:postal_codeInput, phone_number = :phone_numberInput,
	email_id = :email_idInput
	WHERE customer_ID = :corresponding_ID_in_td;

----------------------------------------
--------- Queries for Booking ----------
-----------------------------------------
--
-- SELECT query for `bookings` display
--
SELECT bookings.booking_ID as booking_ID,	
	DATE_FORMAT(bookings.booking_date, '%m/%d/%Y') as booking_date,	
	DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') as departure_date,	
	DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') as arrival_date,	
	bookings.number_adults as number_adults,	
	bookings.number_children as number_children,	
	bookings.travelLocation_ID as travelLocation_ID,	
	bookings.customer_ID as customer_ID 
	FROM bookings	
	LEFT JOIN travel_location ON bookings.travelLocation_ID = travel_location.travelLocation_ID
	LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID	
	GROUP BY bookings.booking_ID	
	ORDER BY bookings.booking_ID;
--
-- SELECT query for customer name in dropdown	
--	
SELECT customer_ID, CONCAT(first_name, ' ', last_name) AS customer_name 
		FROM customers ORDER BY customer_ID;
--
-- SELECT query to display the bookings in the table filtered based on the customer name
--
SELECT bookings.booking_ID as booking_ID,
    DATE_FORMAT(bookings.booking_date, '%m/%d/%Y') as booking_date,
    DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') as departure_date,
    DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') as arrival_date,
    bookings.number_adults as number_adults, 
    bookings.number_children as number_children, 
    bookings.travelLocation_ID as travelLocation_ID,
    bookings.customer_ID as customer_ID 
    FROM bookings
    LEFT JOIN travel_location ON bookings.travelLocation_ID = travel_location.travelLocation_ID
    LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID
    WHERE customers.customer_ID = :customer_IDInput
    GROUP BY bookings.booking_ID 
    ORDER BY bookings.booking_ID
--
-- SELECT query to get city names in dropdown
--
SELECT travelLocation_ID, city FROM travel_location 
	ORDER BY travelLocation_ID;
--
-- Add new booking
--
INSERT INTO bookings(customer_ID, travelLocation_ID, departure_date, arrival_date, number_adults, number_children)
			VALUES(:customer_IDInput,  :travel_locationInput, :departure_dateInput, :arrival_dateInput, :number_adultsInput, :number_childrenInput);
--
-- Delete booking
--
DELETE FROM booking WHERE booking_ID = :corresponding_ID_in_td;
--------------------------------------------
--------- Queries for Travel Location -------
---------------------------------------------
--
-- SELECT query for `travel_location` display
-- 
SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, 
                      FORMAT(travel_location.amount_perAdult, 2) AS price_adult, FORMAT(travel_location.amount_perChild,2) AS price_child, 
                      COUNT(bookings.booking_ID) AS count_bookings, COUNT(tour_guide.tourGuide_ID) AS count_guides, 
                      SUM(number_adults) + SUM(number_children) AS adults_kids, 
                      ROUND(AVG(ratings.rating),2) AS ave_review 
                      FROM travel_location 
                      LEFT JOIN bookings ON travel_location.travelLocation_ID = bookings.travelLocation_ID 
                      LEFT JOIN assignment ON bookings.booking_ID = assignment.booking_ID 
                      LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID 
                      LEFT JOIN ratings ON travel_location.travelLocation_ID = ratings.travelLocation_ID 
                      GROUP BY travel_location.travelLocation_ID 
                      ORDER BY travel_location.travelLocation_ID;

-- Display all options (search with selected city/country)
SELECT travel_location.travelLocation_ID AS location_ID, travel_location.city AS city, travel_location.country as country, 
                      FORMAT(travel_location.amount_perAdult, 2) AS price_adult, FORMAT(travel_location.amount_perChild,2) AS price_child, 
                      COUNT(bookings.booking_ID) AS count_bookings, COUNT(tour_guide.tourGuide_ID) AS count_guides, 
                      SUM(number_adults) + SUM(number_children) AS adults_kids, 
                      ROUND(AVG(ratings.rating),2) AS ave_review 
                      FROM travel_location 
                      LEFT JOIN bookings ON travel_location.travelLocation_ID = bookings.travelLocation_ID 
                      LEFT JOIN assignment ON bookings.booking_ID = assignment.booking_ID 
                      LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID 
                      LEFT JOIN ratings ON travel_location.travelLocation_ID = ratings.travelLocation_ID 
						WHERE travel_location.city = :city_input AND travel_location.country = :county_input
						GROUP BY travel_location.travelLocation_ID
						ORDER BY travel_location.travelLocation_ID;

--Add & display new Travel Location data based on form submission
INSERT INTO travel_location (city, country) VALUES (:city_input, :country_input);
--
-- Update query for travel_location
--
UPDATE travel_location SET amount_perAdult=:amount_perAdultInput, amount_perChild=:amount_perChildInput WHERE travelLocation_ID=:travel_locationIDInput
--
-- query for locations in dropdown
--
SELECT travel_location.travelLocation_ID as location_ID,
	CONCAT(travel_location.city, ', ', travel_location.country) AS location_name 
	FROM travel_location;
----------------------------------------
--------- Queries for Tour guide -------
-----------------------------------------
--
-- SELECT query for `tour_guide` display
-- 
SELECT tour_guide.tourGuide_ID as guide_ID, tour_guide.first_Name as first_name, tour_guide.last_Name as last_name,
                     COUNT(assignment.tourGuide_travelLocation) AS count_assignments,
                     COUNT(travel_location.travelLocation_ID) AS count_locations
                     FROM tour_guide 
                     LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID
                     LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID
                     GROUP BY tour_guide.tourGuide_ID
                     ORDER BY tour_guide.tourGuide_ID;
--
-- SELECT query for gettin guide first and last name to populate update form
--
SELECT tourGUide_ID AS guide_ID, first_Name AS first_name, last_Name AS last_name FROM tour_guide WHERE tourGuide_ID = :tour_guideID_input;
--
-- SELECT query that searches for guides with first name similar to user input
--
SELECT tour_guide.tourGuide_ID as guide_ID, tour_guide.first_Name as first_name, tour_guide.last_Name as last_name,
                COUNT(assignment.tourGuide_travelLocation) AS count_assignments,
                COUNT(travel_location.travelLocation_ID) AS count_locations
                FROM tour_guide
                LEFT JOIN assignment ON tour_guide.tourGuide_ID = assignment.tourGuide_ID
                LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID
                WHERE tour_guide.first_Name LIKE  mysql.pool.escape(req.params.s + '%');
--
-- Update query for tour guide
--
UPDATE tour_guide SET first_Name=:first_nameInput, last_Name=:last_nameInput WHERE tourGuide_ID=:tour_guideID_input;
--
-- Insert query for tour guide
--
INSERT INTO tour_guide(first_name, last_name) VALUES(:first_nameInput,:last_nameInput);
--
-- Delete query for tour guide
--
DELETE FROM tour_guide WHERE tourGuide_ID = :tour_guideID_input;
----------------------------------------
--------- Queries for Assignments -------
-----------------------------------------
--
-- SELECT queries for assignment display
--
SELECT assignment.tourGuide_travelLocation AS assignment_ID, assignment.booking_ID AS booking_ID,
    CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) AS guide, 
    CONCAT(travel_location.city, ', ', travel_location.country) AS destination, 
    CONCAT(customers.first_name, ' ', customers.last_name) AS customer,
    DATE_FORMAT(bookings.departure_date, '%m/%d/%Y') AS departure_date, 
    DATE_FORMAT(bookings.arrival_date, '%m/%d/%Y') AS arrival_date,
    SUM(bookings.number_adults) AS count_adults,
    SUM(bookings.number_children) AS count_kids
    FROM assignment
    LEFT JOIN tour_guide ON assignment.tourGuide_ID = tour_guide.tourGuide_ID
    LEFT JOIN travel_location ON assignment.travelLocation_ID = travel_location.travelLocation_ID
    LEFT JOIN bookings ON assignment.booking_ID = bookings.booking_ID
    LEFT JOIN customers ON bookings.customer_ID = customers.customer_ID 
    GROUP BY assignment.tourGuide_travelLocation 
    ORDER BY assignment.tourGuide_travelLocation
--
--SELECT query that gets guide names & display in dropdown
--
SELECT tour_guide.tourGuide_ID as guide_ID, CONCAT(tour_guide.first_name, ' ', tour_guide.last_name) as guide_full_name 
	FROM tour_guide ORDER BY guide_full_name;
--
-- SELECT query that gets locations in dropdown
--
SELECT travel_location.travelLocation_ID as location_ID,
    CONCAT(travel_location.city, ', ', travel_location.country) AS location_name
    FROM travel_location;
--
-- SELECT query that gets the assignment information for update
--
SELECT assignment.tourGuide_travelLocation AS assignment_ID, assignment.booking_ID as booking_ID,
		assignment.tourGuide_ID as guide_ID FROM assignment WHERE tourGuide_travelLocation = :assignment_IDInput;
--
-- SELECT query that gets bookingID that has not been assigned yet
--
SELECT bookings.booking_ID FROM bookings WHERE bookings.booking_ID
    NOT IN (SELECT assignment.booking_ID FROM assignment)
    ORDER BY bookings.booking_ID;
--
-- INSERT query for assignment
--
INSERT INTO assignment (booking_ID, travelLocation_ID, tourGuide_ID)
    VALUES(:booking_IDInput, (SELECT bookings.travelLocation_ID FROM bookings WHERE booking_ID=:booking_IDInput),:tour_guideID_input);
--
-- DELETE query for assignment
--
DELETE FROM assignment WHERE tourGuide_travelLocation = :assignment_IDInput;
--
-- UPDATE query for assignment
--
UPDATE assignment 
	SET booking_ID=:booking_IDInput, tourGuide_ID=IF(:tour_guideID_input='NULL', NULL,:tour_guideID_input),
    travelLocation_ID=(SELECT bookings.travelLocation_ID FROM bookings WHERE booking_ID=:booking_IDInput) 
    WHERE tourGuide_travelLocation=:assignment_IDInput

----------------------------------------
--------- Queries for Payment ----------
-----------------------------------------

--
-- SELECT to display payment table
--
SELECT payment.payment_ID, payment.booking_ID, payment.payment_amount, 
	DATE_FORMAT(payment.payment_date, '%m/%d/%Y') as payment_date, 
    payment.payment_description 
    FROM payment 
    LEFT JOIN bookings ON payment.booking_ID = bookings.booking_ID 
    GROUP BY payment.payment_ID;
--
-- SELECT to display booking ID on dropdown 
--
SELECT payment.booking_ID AS booking_ID 
	FROM payment 
	ORDER BY payment.booking_ID;
--
-- SELECT to display the payment in the table on filter based on booking
--
SELECT payment.payment_ID, payment.booking_ID, payment.payment_amount,
        DATE_FORMAT(payment.payment_date, '%m/%d/%Y') as payment_date,
		payment.payment_description 
		FROM payment 
		LEFT JOIN bookings ON payment.booking_ID = bookings.booking_ID 
		WHERE payment.booking_ID = :booking_IDInput 
		GROUP BY payment.payment_ID ORDER BY payment.payment_ID;
--
-- SELECT to get booking ID that has not been paid yet on the dropdown
-- 
SELECT bookings.booking_ID FROM bookings WHERE bookings.booking_ID
       NOT IN (SELECT payment.booking_ID FROM payment)
       ORDER BY bookings.booking_ID;
--
-- DELETE query for payment
--
DELETE FROM payment WHERE payment_ID = :payment_IDInput;
--
-- INSERT query for payment
--
INSERT INTO payment(booking_ID, payment_amount, payment_date,payment_description) 
		VALUES(:booking_IDInput, (SELECT (((t.amount_perAdult*b.number_adults)+ (t.amount_perChild*b.number_children)) * 
					(DATEDIFF(b.arrival_date, b.departure_date))) AS payment_amount FROM bookings b 
					INNER JOIN travel_location t ON b.travelLocation_ID = t.travelLocation_ID 
					WHERE booking_ID = :booking_IDInput), :payment_dateInput,:payment_descriptionInput);
---------------------------------------
--------- Queries for Rating ----------
---------------------------------------

--
-- SELECT query for `ratings` display
--
SELECT ratings.rating_ID, ratings.travelLocation_ID,
		travel_location.city,
		ratings.customer_ID,
		CONCAT(customers.first_name, ' ', customers.last_name) AS customer_name,
		ratings.rating, ratings.review
		FROM ratings
		LEFT JOIN travel_location ON ratings.travelLocation_ID = travel_location.travelLocation_ID
		LEFT JOIN customers ON ratings.customer_ID = customers.customer_ID
		GROUP BY ratings.rating_ID
		ORDER BY ratings.rating_ID;
--
-- SELECT query to filter ratings table using rating
--
SELECT ratings.rating_ID, ratings.travelLocation_ID,
		travel_location.city,
		ratings.customer_ID,
		CONCAT(customers.first_name, ' ', customers.last_name) AS customer_name,
		ratings.rating, ratings.review
		FROM ratings
		LEFT JOIN travel_location ON ratings.travelLocation_ID = travel_location.travelLocation_ID
		LEFT JOIN customers ON ratings.customer_ID = customers.customer_ID
		WHERE ratings.rating = :ratingInput
		GROUP BY ratings.rating_ID
		ORDER BY ratings.rating_ID;
--
-- SELECT query to get customer name in dropdown
--
SELECT customer_ID, CONCAT(first_name, ' ', last_name) AS customer_name 
		FROM customers ORDER BY customer_ID;
--
-- SELECT query to get city name in dropdown
--
SELECT travelLocation_ID, city FROM travel_location ORDER BY travelLocation_ID;		
--
-- Add new Rating
--
INSERT INTO ratings(customer_ID, travelLocation_ID, rating, review)
			VALUES(:customer_IDInput, :travel_locationInput,
				 :ratingInput, :reviewInput);