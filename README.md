#Cloud Academy Tech Test (Giampiero Bono)

Tech assignment for Cloud Academy 

Node JS program, ES6. No third party libraries used.

To run it: 
`npm run start`

Original README text:

The data in the data.json file represent the data point to be plotted on a line graph.

- Write a function that having a start_date and an end_date as input returns the subset of data included between the two for the slug "aggregation-overall" and for the key "score"
  - Assume the start_date and end_date exactly match the "x" key in the serie
  - start_date and end_date must be included in the returned data.
  - The series always contains start_date and end_date
	
  Input: 
  start_date: "2015-08-19T14:00:19.352000Z"
  end_date: "2015-10-12T07:27:47.493000Z"

  Expected result:
  ```json
  [
    {
      "y":282,
      "x":"2015-08-19T14:00:19.352000Z"
    },
    {
      "y":227,
      "x":"2015-10-08T14:45:31.991000Z"
    },
    {
      "y":185,
      "x":"2015-10-12T07:27:47.493000Z"
    }
  ]
  ```

- Write the same function as above to match the case that:
  - The series does not always contains end_date or start_date
  - Start_date and end_date don't match the "x" key in the serie

- Consider that we want to display the data with the key "extra" on mouse over on a point of the key "score". Write a function to format the data for this use case. 