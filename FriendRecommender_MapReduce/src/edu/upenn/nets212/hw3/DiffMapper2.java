package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.*;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class DiffMapper2 extends Mapper<LongWritable, Text, Text, DoubleWritable>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException {
	
		String valstring = value.toString();
		String [] valarray = valstring.split("\t");
		Double valdouble = Double.parseDouble(valarray[1].replace(" ", ""));
		
		DoubleWritable valueLW = new DoubleWritable(valdouble);
		
		//emit all weights to same key
		context.write(new Text(""), valueLW);
		
	}
}
	