package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

public class NormalizeMapper extends Mapper<LongWritable, Text, Text, Text>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException{
		
		String [] valarray;
		String valstring = value.toString();
		
		context.write(new Text("1"), new Text(valstring));
	}
}
