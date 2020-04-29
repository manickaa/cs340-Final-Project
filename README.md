The outline of the project is to design a database system for a generic tourism company. 
The project will focus on the purchase organization (guides, customer, etc) as related to each destination purchase. 
We would imagine this as a mini version of Expedia website, where a customer can make bookings for different travel 
locations and make payment based on the bookings made.
The customer will also be assigned tour guides for the locations, he has booked to travel. 
The customer can also give ratings to the locations,he visited and also select the travel locations based on the ratings given by other customers.

Relationships ● Customer and Bookings: 
                  ➔ Customer to Bookings: 
                      ❖ Zero to Many relationship 
                      ❖ A customer can have zero or many bookings done 
                  ➔ Bookings to Customer: 
                      ❖ One to One Relationship 
                      ❖ A booking can only be associated to one customer 
                      ❖ A booking must have a customer 
              ● Booking and Travel Location: 
                  ➔ Booking to Travel Location: 
                      ❖ One to One relationship 
                      ❖ A booking can only be associated to one travel location 
                      ❖ A Travel location can be associated with zero to many bookings 
                  ➔ Travel Location to Bookings: 
                      ❖ Zero to Many relationship 
                      ❖ A travel location can have many bookings, i.e, a trip can have many bookings 
              ● Bookings and Payment: 
                  ➔ Bookings to Payment: 
                      ❖ One to One relationship 
                      ❖ A booking can be associated to only one payment 
                      ❖ A payment must have at least one booking. 
                  ➔ Payment to Bookings: 
                      ❖ One to One relationship 
                      ❖ A payment can be done for only one booking 
              ● Tour Guide and Travel Location 
                  ➔ Many to Many Relationship 
                  ➔ A tour guide can be associated zero to many travel locations 
                  ➔ A travel location can have zero to many tour guides. 
                  ➔ Assignment Table will hold M-M relationship between tour guide and travel location 
              ● Customer and Travel Location: 
                  ➔ Many to Many Relationship 
                  ➔ A customer would have travelled to zero or many travel locations. 
                    Likewise, a travel location would be visited by zero or many customers. 
                  ➔ The Ratings table will have attributes for the rating and reviews posted by different customers, which will help the customers choose the travel location based on the rating. 
                  ❖ This table will resolve the M-M relationship between Customer and Travel Location with respect to reviews. 
                  ❖ Travel Location can have zero or more ratings 
                  ❖ A customer can give ratings for zero or more locations.
