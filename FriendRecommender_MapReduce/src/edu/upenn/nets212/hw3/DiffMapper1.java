package edu.upenn.nets212.hw3;

import java.io.IOException;

import org.apache.hadoop.io.LongWritable;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.Mapper;

public class DiffMapper1 extends Mapper<LongWritable, Text, Text, Text>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException {
		
		String valstring = value.toString();
		String[] valarray = valstring.split("\t");
		
		if(valarray.length == 3) {
			String name = valarray[0].replace(" ", "");
			if (name.contains("$")){
				String weights = valarray[2].replace(" ", "");
				String [] weightsarray = weights.split(",");
				for (int i = 0; i < weightsarray.length; i++) {
					String currweight = weightsarray[i];
					String [] currweightarray = currweight.replace(" ", "").split("%");
					String currweightname = currweightarray[0];
					String currweightnum = currweightarray[2];
					String curredge = name + "%" + currweightname;
					context.write(new Text(curredge), new Text(currweightnum));
					
					System.out.println("*********DiffMapper key: " + curredge);
					System.out.println("value: " + currweightnum);
				}
			}
			
		}
			
		
		
				
		
		
		
	}
}
	
