package edu.upenn.nets212.hw3;
import org.apache.hadoop.mapreduce.*;

import java.io.IOException;

import org.apache.hadoop.io.*;

public class InitMapper1 extends Mapper<LongWritable, Text, Text, Text>{

	@Override
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException {
		
		//convert value to string
		String valString = value.toString();
		
		if(valString != null) {
			//split into node and neighbors
			String[] valArray = valString.split("\t");
			
			//emit labelled vertices
			String user = valArray[0];
			String labels = "";
			
			if(valArray.length == 2) {
				labels = valArray[1];
			}
			else {
				labels = valArray[1] + "\t" + valArray[2];
			}
			
			
			System.out.println("************** InitMapper key: " + user );
			System.out.println("value: " + labels );
			
			context.write(new Text(user), new Text(labels));
			
		}
		
		
		
	}
}
