package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

public class InitMapper3 extends Mapper<LongWritable, Text, Text, Text>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException{
		
		String valstring = value.toString();
		String [] valArray = valstring.split("\t");
		
		String user = valArray[0];
		String interestsarraystring = valArray[1].replace(" ", "");
		String weightpluslabel = valArray[2];
		
		//send users
		context.write(new Text(user), new Text(interestsarraystring + "\t" + weightpluslabel));
		
		//send interests
		String [] interestsarray = interestsarraystring.split(",");
		for (int i = 0; i < interestsarray.length; i++) {
			String interest = interestsarray[i].replace(" ", "");
			Text interestText = new Text("@" + interest);
			context.write(interestText, new Text(user));
		}
	}
}
