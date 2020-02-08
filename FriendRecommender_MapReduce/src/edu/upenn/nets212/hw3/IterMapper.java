package edu.upenn.nets212.hw3;

import java.io.IOException;
import java.math.BigDecimal;
import java.text.DecimalFormat;

import org.apache.hadoop.io.*;
import org.apache.hadoop.io.Text;
import org.apache.hadoop.mapreduce.*;

public class IterMapper extends Mapper<LongWritable, Text, Text, Text>{
	
	public void map(LongWritable key, Text value, Context context) 
			throws IOException, InterruptedException{
		
		//convert Text to String
		String valString = value.toString();
		
		
		
		//Split valString into array
		String [] valArray = valString.split("\t");	
		
			//send nodes and neighbors
			if(!(valString.replace(" ", "").charAt(0)=='#')) {

				Text nametext = new Text(valArray[0].replace(" ", ""));
				Text neighborstext = new Text(valArray[1].replace(" ", ""));
				
				System.out.println("***********neighbors IterMapper key: " + nametext.toString());
				System.out.println("value: " + neighborstext.toString());
				context.write(nametext, neighborstext);
			}
		
		
			
		//only check weights of nodes that have weights
		if (valArray.length == 3) {
			
			/*Text nametext = new Text(valArray[0]
			Text neighborstext = new Text(valArray[1]);
			context.write(nametext, neighborstext);
			System.out.println("***********length 3 neighbors  IterMapper key: " + nametext.toString());
			System.out.println("value: " + neighborstext.toString());*/
				
			//get weight
			String[] arrayoflabelplusweights = valArray[2].split(",");
			for (int j = 0; j < arrayoflabelplusweights.length; j++) {
				
				String [] labelplusweightarray = arrayoflabelplusweights[j].split("%");
				
				//send weights for addition
				context.write(new Text("#" + labelplusweightarray[0].replace(" ", "") + "%totalweight"), new Text(labelplusweightarray[2].replace(" ", "")));
				System.out.println("***********weight totals IterMapper key: " + "#" + labelplusweightarray[0].replace(" ", "") + "%totalweight");
				System.out.println("value: " + labelplusweightarray[2].replace(" ", ""));
				
				double weight = Double.parseDouble(labelplusweightarray[2]);
				
				//compute weight to send per node
				String outNodes = valArray[1].replace(" ", "");
				String [] outNodesArray = outNodes.split(",");
				int numOutNodes = outNodesArray.length;
				double numDouble = numOutNodes;
				double weightPerNode = weight / numDouble;
				
				
				//weightPerNode = df.format(weightPerNode);
				
				if (Double.toString(weightPerNode).contains("E")) {
					weightPerNode = 0.0;
				}
				
				//create new labelplusweight
				String newlabelplusweight = labelplusweightarray[0] + "%" + labelplusweightarray[1] +
						"%" + Double.toString(weightPerNode);
				
				
				
				//send weightPerNode to all outNodes
				for (int i = 0; i < outNodesArray.length; i++) {
					System.out.println("***********weight  IterMapper weight key: " + outNodesArray[i]);
					System.out.println(" value: " + newlabelplusweight);
					context.write(new Text(outNodesArray[i].replace(" ", "")), new Text("!!" + newlabelplusweight.replace(" ", "")));
				}
			}
				
		}
				
	}
}
